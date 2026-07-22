import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applicationSchema } from '@/lib/validations'
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts'
import { sanitizeInput } from '@/lib/sanitize'
import type { GeminiEvaluationResponse } from '@/lib/types'

/**
 * POST /api/evaluate
 *
 * Phase 5 — Full Gemini API integration.
 * 1. Verify authentication
 * 2. Validate + sanitize input
 * 3. Save application to Supabase
 * 4. Call Gemini API (gemini-2.0-flash)
 * 5. Parse response, save report to Supabase
 * 6. Return report_id to frontend
 */
export async function POST(request: Request) {
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

    // 1b. Rate limiting — 3 calls per user per hour (Blueprint Section 10.5)
    const adminSupabase = createAdminClient()
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
      traction: sanitizeInput(parseResult.data.traction),
      team: sanitizeInput(parseResult.data.team),
      competitors: sanitizeInput(parseResult.data.competitors),
    }

    // 4. Save application to Supabase using admin client (bypasses RLS)

    const { data: application, error: appError } = await adminSupabase
      .from('applications')
      .insert({
        user_id: user.id,
        one_liner: sanitizedData.one_liner,
        problem: sanitizedData.problem,
        traction: sanitizedData.traction,
        team: sanitizedData.team,
        competitors: sanitizedData.competitors,
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

    // 5. Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    })

    const userPrompt = buildUserPrompt(sanitizedData)

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
    })

    const responseText = result.response.text()

    // 6. Parse the JSON response from Gemini
    let evaluation: GeminiEvaluationResponse
    try {
      evaluation = JSON.parse(responseText)
    } catch {
      console.error('Failed to parse Gemini response:', responseText)
      // Update application status to reflect failure
      await adminSupabase
        .from('applications')
        .update({ status: 'pending' })
        .eq('id', application.id)

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
        application_id: application.id,
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
      return NextResponse.json(
        { error: 'Failed to save your report. Please try again.' },
        { status: 500 }
      )
    }

    // 9. Update application status to complete
    await adminSupabase
      .from('applications')
      .update({ status: 'complete' })
      .eq('id', application.id)

    // 10. Return report ID to frontend
    return NextResponse.json({
      report_id: report.id,
      status: 'complete',
    })
  } catch (err) {
    console.error('Evaluate API error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
