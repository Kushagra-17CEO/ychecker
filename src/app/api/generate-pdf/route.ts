import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ReportPDF from '@/lib/pdf-template'
import React from 'react'

/**
 * POST /api/generate-pdf
 *
 * Blueprint Phase 10:
 * 1. Render report to PDF using @react-pdf/renderer
 * 2. Upload to Supabase Storage (private bucket)
 * 3. Save signed URL to report.pdf_url
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
        { error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    // 2. Get report_id from request
    const { report_id } = await request.json()

    if (!report_id) {
      return NextResponse.json(
        { error: 'report_id is required.' },
        { status: 400 }
      )
    }

    // 3. Fetch the report (must be unlocked and belong to user)
    const adminSupabase = createAdminClient()
    const { data: report, error: reportError } = await adminSupabase
      .from('reports')
      .select('*')
      .eq('id', report_id)
      .eq('user_id', user.id)
      .eq('is_unlocked', true)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found or not unlocked.' },
        { status: 404 }
      )
    }

    // 4. If PDF already exists, return existing URL
    if (report.pdf_url) {
      return NextResponse.json({ pdf_url: report.pdf_url })
    }

    // 5. Render PDF to buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfElement = React.createElement(ReportPDF, {
      overall_score: report.overall_score,
      verdict: report.verdict,
      sections: report.sections,
      blind_spots: report.blind_spots || [],
      the_secret_score: report.the_secret_score,
      the_secret_explanation: report.the_secret_explanation,
      created_at: report.created_at,
    }) as any

    const pdfBuffer = await renderToBuffer(pdfElement)

    // 6. Upload to Supabase Storage
    const fileName = `reports/${user.id}/${report_id}.pdf`

    const { error: uploadError } = await adminSupabase.storage
      .from('pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('PDF upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload PDF.' },
        { status: 500 }
      )
    }

    // 7. Get a signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } =
      await adminSupabase.storage
        .from('pdfs')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365)

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL error:', signedUrlError)
      return NextResponse.json(
        { error: 'Failed to generate download link.' },
        { status: 500 }
      )
    }

    const pdfUrl = signedUrlData.signedUrl

    // 8. Save pdf_url to report record
    await adminSupabase
      .from('reports')
      .update({ pdf_url: pdfUrl })
      .eq('id', report_id)

    return NextResponse.json({ pdf_url: pdfUrl })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate PDF.' },
      { status: 500 }
    )
  }
}
