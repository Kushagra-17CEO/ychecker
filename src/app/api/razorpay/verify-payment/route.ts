import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import ReportReadyEmail from '@/../emails/report-ready'
import ExpertReviewOrderedEmail from '@/../emails/expert-review-ordered'
import AdminExpertNotifyEmail from '@/../emails/admin-expert-notify'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/razorpay/verify-payment
 *
 * Blueprint Section 8.2 Step 5:
 * - Verify HMAC-SHA256 signature
 * - Update payment record
 * - Branch by tier: unlock report (AI) or set expert_pending (Expert)
 */
export async function POST(request: Request) {
  try {
    // 1. Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in.' },
        { status: 401 }
      )
    }

    // Rate limit — authenticated tier
    const rl = await checkRateLimit(user.id, 'authenticated', '/api/razorpay/verify-payment')
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter)

    // 2. Parse request
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      report_id,
      tier,
    } = await request.json()

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !report_id) {
      return NextResponse.json(
        { error: 'Missing payment verification data.' },
        { status: 400 }
      )
    }

    // 3. Verify HMAC-SHA256 signature (CRITICAL — Blueprint Section 8.2 Step 5)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    )

    if (!isValid) {
      console.error('Invalid Razorpay signature')
      return NextResponse.json(
        { error: 'Payment verification failed.' },
        { status: 400 }
      )
    }

    // 4. Update payment record
    const adminSupabase = createAdminClient()

    await adminSupabase
      .from('payments')
      .update({
        razorpay_payment_id,
        status: 'complete',
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id)

    // 5. Branch by tier
    if (tier === 'expert') {
      // Set application to expert_pending
      const { data: report } = await adminSupabase
        .from('reports')
        .select('application_id')
        .eq('id', report_id)
        .single()

      if (report?.application_id) {
        await adminSupabase
          .from('applications')
          .update({
            status: 'expert_pending',
            report_type: 'expert',
          })
          .eq('id', report.application_id)
      }

      // Update report type but don't unlock yet (expert reviews are manual)
      await adminSupabase
        .from('reports')
        .update({ is_unlocked: true })
        .eq('id', report_id)

      // Send expert confirmation email to user + admin notification (non-blocking)
      sendEmail({
        to: user.email!,
        subject: "We've Received Your Expert Review Order",
        react: ExpertReviewOrderedEmail(),
      }).catch((e) => console.error('Expert email to user failed:', e))

      // Fetch user's one-liner for admin notification
      if (report?.application_id) {
        adminSupabase
          .from('applications')
          .select('one_liner')
          .eq('id', report.application_id)
          .single()
          .then(({ data: app }) => {
            const adminEmail = process.env.ADMIN_EMAIL
            if (adminEmail) {
              sendEmail({
                to: adminEmail,
                subject: 'New Expert Review Order — Action Required',
                react: AdminExpertNotifyEmail({
                  userEmail: user.email || 'unknown',
                  oneLiner: app?.one_liner || 'N/A',
                }),
              }).catch((e) => console.error('Admin email failed:', e))
            }
          })
      }
    } else {
      // AI Report — unlock immediately
      await adminSupabase
        .from('reports')
        .update({ is_unlocked: true })
        .eq('id', report_id)

      // Update application report_type
      const { data: report } = await adminSupabase
        .from('reports')
        .select('application_id')
        .eq('id', report_id)
        .single()

      if (report?.application_id) {
        await adminSupabase
          .from('applications')
          .update({ report_type: 'ai' })
          .eq('id', report.application_id)
      }

      // Send "Your AI Report is ready" email (non-blocking)
      sendEmail({
        to: user.email!,
        subject: 'Your AI Report Is Ready',
        react: ReportReadyEmail({ reportId: report_id }),
      }).catch((e) => console.error('Report ready email failed:', e))
    }

    return NextResponse.json({
      success: true,
      redirect: tier === 'expert'
        ? '/expert-pending'
        : `/report/${report_id}?payment=success`,
    })
  } catch (err) {
    console.error('Verify payment error:', err)
    return NextResponse.json(
      { error: 'Payment verification failed. Please contact support.' },
      { status: 500 }
    )
  }
}
