import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/razorpay/webhook
 *
 * Blueprint Section 8.2 Step 6:
 * Backup webhook for payment.captured event.
 * Verifies X-Razorpay-Signature header.
 * Unlocks the report if the frontend verify call was missed.
 */
export async function POST(request: Request) {
  try {
    // Rate limit — public tier
    const clientIp = await getClientIp()
    const rl = await checkRateLimit(clientIp, 'public', '/api/razorpay/webhook')
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter)

    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Only handle payment.captured events
    if (event.event !== 'payment.captured') {
      return NextResponse.json({ status: 'ignored' })
    }

    const payment = event.payload?.payment?.entity
    if (!payment) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const orderId = payment.order_id
    const paymentId = payment.id

    const adminSupabase = createAdminClient()

    // Find the payment record by order_id
    const { data: paymentRecord } = await adminSupabase
      .from('payments')
      .select('id, report_id, status')
      .eq('razorpay_order_id', orderId)
      .single()

    if (!paymentRecord) {
      console.error('Payment record not found for order:', orderId)
      return NextResponse.json({ status: 'not_found' })
    }

    // Only process if not already complete (idempotent)
    if (paymentRecord.status === 'complete') {
      return NextResponse.json({ status: 'already_processed' })
    }

    // Update payment record
    await adminSupabase
      .from('payments')
      .update({
        razorpay_payment_id: paymentId,
        status: 'complete',
      })
      .eq('id', paymentRecord.id)

    // Unlock the report
    await adminSupabase
      .from('reports')
      .update({ is_unlocked: true })
      .eq('id', paymentRecord.report_id)

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
