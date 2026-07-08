import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applicationSchema } from '@/lib/validations'

/**
 * POST /api/evaluate
 * 
 * Phase 4 stub — validates input and returns a mock report ID.
 * Phase 5 will replace this with real Gemini API integration.
 */
export async function POST(request: Request) {
  try {
    // 1. Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to evaluate your application.' },
        { status: 401 }
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

    // 3. For Phase 4 — return a mock report ID
    //    Phase 5 will: call Gemini API, save to Supabase, return real ID
    const mockReportId = 'mock-' + Date.now()

    return NextResponse.json({
      report_id: mockReportId,
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
