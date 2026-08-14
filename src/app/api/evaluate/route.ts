import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applicationSchema } from '@/lib/validations'
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts'
import { sanitizeInput } from '@/lib/sanitize'
import type { GeminiEvaluationResponse } from '@/lib/types'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

/**
 * Allow up to 60 seconds for the Gemini API call.
 * Vercel Hobby = max 60s, Pro = max 300s.
 */
export const maxDuration = 60

/**
 * POST /api/evaluate
 *
 * 1. Verify authentication
 * 2. Validate + sanitize input
 * 3. Save application to Supabase
 * 4. Call Gemini API (gemini-2.0-flash) via @google/genai SDK
 * 5. Parse response, save report to Supabase
 * 6. Return report_id to frontend
 */
export async function POST(request: Request) {
  let applicationId: string | null = null
  const adminSupabase = createAdminClient()

  try {
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to evaluate your application.' },
        { status: 401 }
      )
    }

    // Rate limit — authenticated tier (general abuse prevention)
    const rl = await checkRateLimit(user.id, 'authenticated', '/api/evaluate')
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter)

    // 1b. Rate limiting — 3 calls per user per hour (Blueprint Section 10.5)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { count: recentCount } = await adminSupabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo)

    if (recentCount !== null && recentCount >= 3) {
      return NextResponse.json(
        {
          error:
            'Rate limit reached. You can submit up to 3 applications per hour. Please try again later.',
        },
        { status: 429 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const parseResult = applicationSchema.safeParse(body)

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || 'Invalid application data.' },
        { status: 400 }
      )
    }

    // 3. Sanitize all user input before sending to Gemini (Blueprint Section 10.4)
    const sanitizedData = {
      one_liner: sanitizeInput(parseResult.data.one_liner),
      problem: sanitizeInput(parseResult.data.problem),
      progress: sanitizeInput(parseResult.data.progress),
      why_this_idea: sanitizeInput(parseResult.data.why_this_idea),
      unique_insight: sanitizeInput(parseResult.data.unique_insight),
      revenue: sanitizeInput(parseResult.data.revenue),
    }

    // 4. Save application to Supabase using admin client (bypasses RLS)
    const { data: application, error: appError } = await adminSupabase
      .from('applications')
      .insert({
        user_id: user.id,
        one_liner: sanitizedData.one_liner,
        problem: sanitizedData.problem,
        progress: sanitizedData.progress,
        why_this_idea: sanitizedData.why_this_idea,
        unique_insight: sanitizedData.unique_insight,
        revenue: sanitizedData.revenue,
        report_type: 'ai',
        status: 'processing',
      })
      .select('id')
      .single()

    if (appError || !application) {
      console.error('Failed to save application:', appError)
      return NextResponse.json(
        { error: 'Failed to save your application. Please try again.' },
        { status: 500 }
      )
    }

    applicationId = application.id

    // 5. Call Gemini API using @google/genai SDK (supports AQ. auth keys)
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set')
      await adminSupabase
        .from('applications')
        .update({ status: 'pending' })
        .eq('id', applicationId)
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })
    const userPrompt = buildUserPrompt(sanitizedData)

    let responseText: string
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      })

      responseText = result.text ?? ''
      if (!responseText) {
        throw new Error('Gemini returned empty response')
      }
    } catch (geminiErr) {
      console.error('Gemini API call failed:', geminiErr)
      await adminSupabase
        .from('applications')
        .update({ status: 'pending' })
        .eq('id', applicationId)
      return NextResponse.json(
        { error: 'AI evaluation failed. Please try again.' },
        { status: 502 }
      )
    }

    // 6. Parse the JSON response from Gemini
    let evaluation: GeminiEvaluationResponse
    try {
      evaluation = JSON.parse(responseText)
    } catch {
      console.error('Failed to parse Gemini response:', responseText)
      await adminSupabase
        .from('applications')
        .update({ status: 'pending' })
        .eq('id', applicationId)

      return NextResponse.json(
        { error: 'AI returned an invalid response. Please try again.' },
        { status: 500 }
      )
    }

    // 7. Derive aggregated fields from sections
    const allStrengths: string[] = []
    const allWeaknesses: string[] = []
    const allFluffFlags: string[] = []
    const rewriteSuggestions: Record<string, string> = {}

    for (const [key, section] of Object.entries(evaluation.sections)) {
      if (section.strengths) allStrengths.push(...section.strengths)
      if (section.weaknesses) allWeaknesses.push(...section.weaknesses)
      if (section.fluff_flags) allFluffFlags.push(...section.fluff_flags)
      if (section.rewrite_suggestion) rewriteSuggestions[key] = section.rewrite_suggestion
    }

    // 8. Save report to Supabase
    const { data: report, error: reportError } = await adminSupabase
      .from('reports')
      .insert({
        application_id: applicationId,
        user_id: user.id,
        overall_score: Math.max(1, Math.min(100, evaluation.overall_score)),
        strengths: allStrengths,
        weaknesses: allWeaknesses,
        fluff_flags: allFluffFlags,
        blind_spots: evaluation.blind_spots || [],
        rewrite_suggestions: rewriteSuggestions,
        sections: evaluation.sections,
        the_secret_score: Math.max(1, Math.min(10, evaluation.the_secret_score)),
        the_secret_explanation: evaluation.the_secret_explanation || '',
        verdict: evaluation.verdict || '',
        is_unlocked: false,
      })
      .select('id')
      .single()

    if (reportError || !report) {
      console.error('Failed to save report:', reportError)
      await adminSupabase
        .from('applications')
        .update({ status: 'pending' })
        .eq('id', applicationId)
      return NextResponse.json(
        { error: 'Failed to save your report. Please try again.' },
        { status: 500 }
      )
    }

    // 9. Update application status to complete
    await adminSupabase
      .from('applications')
      .update({ status: 'complete' })
      .eq('id', applicationId)

    // 10. Return report ID to frontend
    return NextResponse.json({
      report_id: report.id,
      status: 'complete',
    })
  } catch (err) {
    console.error('Evaluate API error:', err)
    // Reset stuck application status so it doesn't stay at 'processing' forever
    if (applicationId) {
      await adminSupabase
        .from('applications')
        .update({ status: 'pending' })
        .eq('id', applicationId)
        .then(null, (e: unknown) => console.error('Failed to reset application status:', e))
    }
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
