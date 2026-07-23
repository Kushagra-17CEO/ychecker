import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

/**
 * GET /api/report/[id]
 *
 * Fetches a report by ID. Returns teaser data for locked reports
 * and full data for unlocked reports.
 * Only the report owner can access it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to view this report.' },
        { status: 401 }
      )
    }

    // Rate limit — authenticated tier
    const rl = await checkRateLimit(user.id, 'authenticated', '/api/report')
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter)

    // 2. Fetch the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found.' },
        { status: 404 }
      )
    }

    // 3. If locked, return teaser data only
    if (!report.is_unlocked) {
      // Partially obscure the score: show tens digit, hide ones
      const tensDigit = Math.floor(report.overall_score / 10)
      const obscuredScore = `${tensDigit}_`

      // Count strengths/weaknesses for the teaser hook
      const sections = report.sections as Record<string, {
        score: number
        strengths: string[]
        weaknesses: string[]
        fluff_flags: string[]
        rewrite_suggestion: string
      }>

      // Build teaser finding from first section
      const firstSectionKey = Object.keys(sections)[0]
      const firstSection = sections[firstSectionKey]
      const weaknessCount = Object.values(sections).reduce(
        (sum, s) => sum + (s.weaknesses?.length || 0), 0
      )
      const strengthCount = Object.values(sections).reduce(
        (sum, s) => sum + (s.strengths?.length || 0), 0
      )

      // Section labels visible but content blurred
      const sectionLabels = Object.keys(sections).map((key) => ({
        key,
        label: formatSectionLabel(key),
        score: sections[key].score, // Show section scores for teaser
      }))

      return NextResponse.json({
        id: report.id,
        is_unlocked: false,
        teaser: {
          obscured_score: obscuredScore,
          weakness_count: weaknessCount,
          strength_count: strengthCount,
          first_finding: firstSection
            ? `We found ${firstSection.weaknesses?.length || 0} Critical Weaknesses and ${firstSection.strengths?.length || 0} Strong Signals in your ${formatSectionLabel(firstSectionKey)}.`
            : null,
          section_labels: sectionLabels,
          verdict_preview: report.verdict
            ? report.verdict.substring(0, 60) + '...'
            : null,
        },
      })
    }

    // 4. If unlocked, return full report
    return NextResponse.json({
      id: report.id,
      is_unlocked: true,
      overall_score: report.overall_score,
      verdict: report.verdict,
      sections: report.sections,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      fluff_flags: report.fluff_flags,
      blind_spots: report.blind_spots,
      rewrite_suggestions: report.rewrite_suggestions,
      the_secret_score: report.the_secret_score,
      the_secret_explanation: report.the_secret_explanation,
      pdf_url: report.pdf_url,
      created_at: report.created_at,
    })
  } catch (err) {
    console.error('Report API error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

function formatSectionLabel(key: string): string {
  const labels: Record<string, string> = {
    one_liner: 'One-Liner',
    problem: 'Problem & Solution',
    traction: 'Traction & Metrics',
    team: 'Team & Founder-Market Fit',
    competitors: 'Competitor Landscape',
  }
  return labels[key] || key
}
