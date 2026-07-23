import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin-auth'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * GET /api/admin/users
 *
 * Blueprint 13.3: Returns all users with applications, reports, payments.
 * Protected by admin session cookie.
 */
export async function GET() {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit — authenticated tier (admin)
  const clientIp = await getClientIp()
  const rl = await checkRateLimit(clientIp, 'authenticated', '/api/admin/users')
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter)

  const adminSupabase = createAdminClient()

  // Fetch all users from auth
  const { data: authData, error: authError } =
    await adminSupabase.auth.admin.listUsers({ perPage: 1000 })

  if (authError) {
    console.error('Failed to list users:', authError)
    return NextResponse.json(
      { error: 'Failed to fetch users.' },
      { status: 500 }
    )
  }

  const users = authData.users || []

  // Fetch all applications with reports
  const { data: applications } = await adminSupabase
    .from('applications')
    .select(
      `
      id,
      user_id,
      one_liner,
      problem,
      traction,
      team,
      competitors,
      status,
      report_type,
      created_at,
      reports (
        id,
        overall_score,
        is_unlocked
      )
    `
    )
    .order('created_at', { ascending: false })

  // Fetch all completed payments for revenue
  const { data: payments } = await adminSupabase
    .from('payments')
    .select('user_id, tier, amount, status, created_at')
    .eq('status', 'complete')

  // Map users with their applications and payments
  const enrichedUsers = users.map((u) => ({
    id: u.id,
    email: u.email || '',
    created_at: u.created_at,
    applications: (applications || []).filter((a) => a.user_id === u.id),
    payments: (payments || []).filter((p) => p.user_id === u.id),
  }))

  // Calculate stats
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const allPayments = payments || []
  const totalRevenue = allPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  )

  const stats = {
    totalSignups: users.length,
    signupsThisWeek: users.filter(
      (u) => new Date(u.created_at) >= weekAgo
    ).length,
    totalAIReports: allPayments.filter((p) => p.tier === 'ai').length,
    totalExpertReviews: allPayments.filter((p) => p.tier === 'expert').length,
    totalRevenue: totalRevenue / 100, // paise to INR
    pendingExpertReviews: (applications || []).filter(
      (a) => a.status === 'expert_pending'
    ).length,
  }

  return NextResponse.json({ users: enrichedUsers, stats })
}
