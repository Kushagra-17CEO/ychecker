import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PRICING } from '@/lib/types'

/**
 * POST /api/razorpay/create-order
 *
 * Blueprint Section 8.2 Step 3:
 * - Verify user is logged in
 * - Receive report_id and tier
 * - Create Razorpay Order
 * - Save to payments table
 * - Return order details to frontend
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
    const { report_id, tier } = await request.json()

    if (!report_id || !tier || !['ai', 'expert'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid request. report_id and tier are required.' },
        { status: 400 }
      )
    }

    // 3. Verify the report exists and belongs to this user
    const adminSupabase = createAdminClient()
    const { data: report, error: reportError } = await adminSupabase
      .from('reports')
      .select('id, is_unlocked')
      .eq('id', report_id)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found.' },
        { status: 404 }
      )
    }

    if (report.is_unlocked) {
      return NextResponse.json(
        { error: 'This report is already unlocked.' },
        { status: 400 }
      )
    }

    // 4. Create Razorpay Order
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const pricing = PRICING[tier as 'ai' | 'expert']

    const order = await razorpay.orders.create({
      amount: pricing.amountPaise,
      currency: 'INR',
      receipt: report_id,
      notes: {
        report_id,
        tier,
        user_id: user.id,
      },
    })

    // 5. Save to payments table
    await adminSupabase.from('payments').insert({
      user_id: user.id,
      report_id,
      razorpay_order_id: order.id,
      amount: pricing.amountPaise,
      tier,
      status: 'pending',
    })

    // 6. Return order details to frontend
    return NextResponse.json({
      order_id: order.id,
      amount: pricing.amountPaise,
      currency: 'INR',
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Create order error:', err)
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    )
  }
}
