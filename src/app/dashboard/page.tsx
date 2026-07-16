import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getScoreColor, SCORE_COLORS } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Dashboard — YChecker',
  description: 'View all your past YC application evaluations.',
}

interface DashboardRow {
  id: string
  one_liner: string
  status: string
  created_at: string
  reports: {
    id: string
    overall_score: number
    is_unlocked: boolean
  }[]
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  // Fetch all applications with linked reports
  const { data: applications } = await supabase
    .from('applications')
    .select(
      `
      id,
      one_liner,
      status,
      created_at,
      reports (
        id,
        overall_score,
        is_unlocked
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const apps = (applications as DashboardRow[] | null) || []

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: '#111111' }}
              >
                Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: '#666666' }}>
                Your YC application evaluations
              </p>
            </div>
            <Link href="/apply" className="btn-primary no-underline text-sm">
              + New Application
            </Link>
          </div>

          {/* Applications Table */}
          {apps.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl"
              style={{ border: '1px dashed #DDDDDD' }}
            >
              <p
                className="text-lg font-semibold mb-2"
                style={{ color: '#111111' }}
              >
                No applications yet
              </p>
              <p className="text-sm mb-6" style={{ color: '#666666' }}>
                Submit your first YC application for evaluation.
              </p>
              <Link href="/apply" className="btn-primary no-underline">
                Check My Application
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: '#666666',
                      borderBottom: '2px solid #EEEEEE',
                    }}
                  >
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">One-Liner</th>
                    <th className="py-3 pr-4 text-center">Score</th>
                    <th className="py-3 pr-4 text-center">Status</th>
                    <th className="py-3 text-right">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => {
                    const report = app.reports?.[0]
                    const score = report?.overall_score
                    const isUnlocked = report?.is_unlocked
                    const scoreColor = score
                      ? getScoreColor(score)
                      : undefined

                    return (
                      <tr
                        key={app.id}
                        style={{ borderBottom: '1px solid #F0F0F0' }}
                      >
                        {/* Date */}
                        <td
                          className="py-4 pr-4 text-sm whitespace-nowrap"
                          style={{ color: '#666666' }}
                        >
                          {new Date(app.created_at).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </td>

                        {/* One-Liner (truncated) */}
                        <td
                          className="py-4 pr-4 text-sm max-w-xs truncate"
                          style={{ color: '#111111' }}
                          title={app.one_liner}
                        >
                          {app.one_liner.length > 60
                            ? `${app.one_liner.slice(0, 60)}…`
                            : app.one_liner}
                        </td>

                        {/* Score */}
                        <td className="py-4 pr-4 text-center">
                          {score ? (
                            <span
                              className="inline-block text-sm font-bold px-2 py-0.5 rounded"
                              style={{
                                color: SCORE_COLORS[scoreColor!],
                                backgroundColor:
                                  scoreColor === 'green'
                                    ? '#E8F5E9'
                                    : scoreColor === 'amber'
                                      ? '#FFF8E1'
                                      : '#FFEBEE',
                              }}
                            >
                              {score}/100
                            </span>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: '#AAAAAA' }}
                            >
                              —
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 pr-4 text-center">
                          <StatusBadge
                            status={app.status}
                            isUnlocked={isUnlocked}
                          />
                        </td>

                        {/* Report Link */}
                        <td className="py-4 text-right">
                          {report ? (
                            <Link
                              href={`/report/${report.id}`}
                              className="text-sm font-medium no-underline transition-colors"
                              style={{ color: '#FF6B35' }}
                            >
                              View Report →
                            </Link>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: '#AAAAAA' }}
                            >
                              Processing…
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function StatusBadge({
  status,
  isUnlocked,
}: {
  status: string
  isUnlocked?: boolean
}) {
  let label: string
  let bgColor: string
  let textColor: string

  if (isUnlocked) {
    label = 'Unlocked'
    bgColor = '#E8F5E9'
    textColor = '#1A7F4B'
  } else if (status === 'expert_pending') {
    label = 'Expert Pending'
    bgColor = '#FFF0E8'
    textColor = '#FF6B35'
  } else if (status === 'expert_delivered') {
    label = 'Expert Delivered'
    bgColor = '#E8F5E9'
    textColor = '#1A7F4B'
  } else if (status === 'complete') {
    label = 'Locked'
    bgColor = '#F5F5F5'
    textColor = '#666666'
  } else if (status === 'processing') {
    label = 'Processing'
    bgColor = '#FFF8E1'
    textColor = '#D68910'
  } else {
    label = 'Pending'
    bgColor = '#F5F5F5'
    textColor = '#AAAAAA'
  }

  return (
    <span
      className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {label}
    </span>
  )
}
