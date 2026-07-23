import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import ExpertDeliveredEmail from '@/../emails/expert-delivered'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/admin/mark-delivered/[id]
 *
 * Blueprint 13.4:
 * - Updates application status to 'expert_delivered'
 * - Sends Expert Review Delivered email to user
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit — authenticated tier (admin)
    const clientIp = await getClientIp()
    const rl = await checkRateLimit(clientIp, 'authenticated', '/api/admin/mark-delivered')
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter)

    const { id: applicationId } = await params

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required.' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Get the application + linked report + user email
    const { data: application, error: appError } = await adminSupabase
      .from('applications')
      .select('id, user_id, status')
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found.' },
        { status: 404 }
      )
    }

    // Update status to expert_delivered
    await adminSupabase
      .from('applications')
      .update({ status: 'expert_delivered' })
      .eq('id', applicationId)

    // Get report ID for email link
    const { data: report } = await adminSupabase
      .from('reports')
      .select('id')
      .eq('application_id', applicationId)
      .single()

    // Get user email
    const { data: userData } = await adminSupabase.auth.admin.getUserById(
      application.user_id
    )

    // Send Expert Review Delivered email
    if (userData?.user?.email && report?.id) {
      sendEmail({
        to: userData.user.email,
        subject: 'Your Expert Review Is Ready',
        react: ExpertDeliveredEmail({ reportId: report.id }),
      }).catch((e) => console.error('Expert delivered email failed:', e))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Mark delivered error:', err)
    return NextResponse.json(
      { error: 'Failed to mark as delivered. Please try again.' },
      { status: 500 }
    )
  }
}
