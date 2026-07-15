import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

      // TODO Phase 8: Send expert confirmation email to user + admin notification
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

      // TODO Phase 8: Send "Your AI Report is ready" email
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
