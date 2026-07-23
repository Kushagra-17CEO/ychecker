'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/* ===================================================================
 * Types
 * =================================================================== */
interface AdminReport {
  id: string
  overall_score: number
  is_unlocked: boolean
}

interface AdminApplication {
  id: string
  user_id: string
  one_liner: string
  problem: string
  traction: string
  team: string
  competitors: string
  status: string
  report_type: string
  created_at: string
  reports: AdminReport[]
}

interface AdminUser {
  id: string
  email: string
  created_at: string
  applications: AdminApplication[]
  payments: { tier: string; amount: number; created_at: string }[]
}

interface AdminStats {
  totalSignups: number
  signupsThisWeek: number
  totalAIReports: number
  totalExpertReviews: number
  totalRevenue: number
  pendingExpertReviews: number
}

/* ===================================================================
 * Admin Dashboard Page
 * =================================================================== */
export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [tab, setTab] = useState<'users' | 'expert' | 'followup'>('users')
  const [deliveredIds, setDeliveredIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setUsers(data.users)
      setStats(data.stats)
    } catch {
      setError('Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkDelivered = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/admin/mark-delivered/${applicationId}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed')
      setDeliveredIds((prev) => new Set(prev).add(applicationId))
    } catch {
      alert('Failed to mark as delivered.')
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F9F9F9' }}
      >
        <p style={{ color: '#666666' }}>Loading admin panel…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F9F9F9' }}
      >
        <p style={{ color: '#C0392B' }}>{error}</p>
      </div>
    )
  }

  // Expert pending queue
  const expertQueue = users.flatMap((u) =>
    u.applications
      .filter((a) => a.status === 'expert_pending' && !deliveredIds.has(a.id))
      .map((a) => ({ ...a, email: u.email }))
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      {/* Header */}
      <header
        className="border-b px-6 py-4"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#EEEEEE',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-black"
              style={{ color: '#FF6B35' }}
            >
              YChecker Admin
            </h1>
          </div>
          <button
            onClick={() => {
              document.cookie =
                'ychecker_admin_session=; Max-Age=0; path=/'
              router.push('/admin/login')
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer"
            style={{
              color: '#666666',
              backgroundColor: '#F5F5F5',
              border: '1px solid #DDDDDD',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 1. Overview Stats Bar */}
        {stats && <StatsBar stats={stats} />}

        {/* Tabs */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-lg w-fit"
          style={{ backgroundColor: '#EEEEEE' }}
        >
          {(['users', 'expert', 'followup'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
              style={{
                backgroundColor: tab === t ? '#FFFFFF' : 'transparent',
                color: tab === t ? '#111111' : '#666666',
                boxShadow:
                  tab === t ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {t === 'users'
                ? `Users (${users.length})`
                : t === 'expert'
                  ? `Expert Queue (${expertQueue.length})`
                  : 'Follow-up Helper'}
            </button>
          ))}
        </div>

        {/* 2. User Table */}
        {tab === 'users' && (
          <UserTable
            users={users}
            expandedUser={expandedUser}
            toggleUser={(id) =>
              setExpandedUser(expandedUser === id ? null : id)
            }
          />
        )}

        {/* 3. Expert Review Queue */}
        {tab === 'expert' && (
          <ExpertQueue
            queue={expertQueue}
            onMarkDelivered={handleMarkDelivered}
          />
        )}

        {/* 4. Follow-up Email Helper */}
        {tab === 'followup' && <FollowUpHelper users={users} />}
      </div>
    </div>
  )
}

/* ===================================================================
 * Stats Bar
 * =================================================================== */
function StatsBar({ stats }: { stats: AdminStats }) {
  const items = [
    { label: 'Total Sign-ups', value: stats.totalSignups },
    { label: 'This Week', value: stats.signupsThisWeek },
    { label: 'AI Reports Sold', value: stats.totalAIReports },
    { label: 'Expert Reviews Sold', value: stats.totalExpertReviews },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
    },
    {
      label: 'Pending Expert',
      value: stats.pendingExpertReviews,
      highlight: stats.pendingExpertReviews > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl p-4"
          style={{
            backgroundColor: '#FFFFFF',
            border: `1px solid ${item.highlight ? '#FF6B35' : '#EEEEEE'}`,
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: '#AAAAAA' }}
          >
            {item.label}
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: item.highlight ? '#FF6B35' : '#111111' }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

/* ===================================================================
 * User Table
 * =================================================================== */
function UserTable({
  users,
  expandedUser,
  toggleUser,
}: {
  users: AdminUser[]
  expandedUser: string | null
  toggleUser: (id: string) => void
}) {
  if (users.length === 0) {
    return (
      <p className="text-sm" style={{ color: '#AAAAAA' }}>
        No users yet.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {users.map((user) => {
        const latestApp = user.applications[0]
        const tierBadge = getTierBadge(user)
        const statusBadge = getStatusBadge(latestApp)
        const isExpanded = expandedUser === user.id

        return (
          <div
            key={user.id}
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EEEEEE',
            }}
          >
            {/* Row */}
            <button
              onClick={() => toggleUser(user.id)}
              className="w-full px-5 py-4 flex items-center gap-4 text-left cursor-pointer"
              style={{ background: 'none', border: 'none' }}
            >
              <span
                className="text-xs whitespace-nowrap"
                style={{ color: '#AAAAAA', minWidth: '80px' }}
              >
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span
                className="text-sm font-medium truncate"
                style={{ color: '#111111', flex: 1, minWidth: 0 }}
              >
                {user.email}
              </span>
              <span
                className="text-xs truncate max-w-[200px]"
                style={{ color: '#666666' }}
              >
                {latestApp?.one_liner
                  ? latestApp.one_liner.length > 40
                    ? `${latestApp.one_liner.slice(0, 40)}…`
                    : latestApp.one_liner
                  : '—'}
              </span>
              {tierBadge}
              {statusBadge}
              <span
                className="text-xs ml-auto"
                style={{ color: '#AAAAAA' }}
              >
                {isExpanded ? '▲' : '▼'}
              </span>
            </button>

            {/* Expanded Details */}
            {isExpanded && latestApp && (
              <div
                className="px-5 pb-5 pt-2"
                style={{ borderTop: '1px solid #F0F0F0' }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-2"
                  style={{ color: '#AAAAAA' }}
                >
                  Full Application Answers
                </p>
                {[
                  { label: 'One-Liner', value: latestApp.one_liner },
                  { label: 'Problem', value: latestApp.problem },
                  { label: 'Traction', value: latestApp.traction },
                  { label: 'Team', value: latestApp.team },
                  { label: 'Competitors', value: latestApp.competitors },
                ].map(({ label, value }) => (
                  <div key={label} className="mb-3">
                    <p
                      className="text-xs font-semibold mb-0.5"
                      style={{ color: '#666666' }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#111111' }}
                    >
                      {value || '—'}
                    </p>
                  </div>
                ))}
                <p className="text-xs mt-2" style={{ color: '#AAAAAA' }}>
                  Email: {user.email}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ===================================================================
 * Expert Review Queue
 * =================================================================== */
function ExpertQueue({
  queue,
  onMarkDelivered,
}: {
  queue: (AdminApplication & { email: string })[]
  onMarkDelivered: (id: string) => void
}) {
  if (queue.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl"
        style={{ border: '1px dashed #DDDDDD' }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: '#111111' }}>
          No pending Expert Reviews
        </p>
        <p className="text-xs" style={{ color: '#AAAAAA' }}>
          Expert Review orders will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {queue.map((item) => (
        <div
          key={item.id}
          className="rounded-xl p-5"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #FFF0E8',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: '#111111' }}
              >
                {item.email}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
                Purchased{' '}
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={() => onMarkDelivered(item.id)}
              className="text-xs font-semibold px-4 py-2 rounded-lg text-white cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: '#1A7F4B' }}
            >
              ✓ Mark as Delivered
            </button>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#333333' }}
          >
            &ldquo;{item.one_liner}&rdquo;
          </p>
        </div>
      ))}
    </div>
  )
}

/* ===================================================================
 * Follow-up Email Helper
 * =================================================================== */
function FollowUpHelper({ users }: { users: AdminUser[] }) {
  const usersWithApps = users.filter((u) => u.applications.length > 0)

  if (usersWithApps.length === 0) {
    return (
      <p className="text-sm" style={{ color: '#AAAAAA' }}>
        No users with applications yet.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: '#666666' }}>
        Click &ldquo;Draft Follow-up&rdquo; to generate a personalised email
        hook. Copy, personalise, and send from your own email client.
      </p>
      {usersWithApps.map((user) => {
        const app = user.applications[0]
        return <FollowUpCard key={user.id} email={user.email} app={app} />
      })}
    </div>
  )
}

function FollowUpCard({
  email,
  app,
}: {
  email: string
  app: AdminApplication
}) {
  const [showDraft, setShowDraft] = useState(false)

  const draft = `Hi there,

I noticed your application for "${app.one_liner}" — here's one thing most founders in this space miss when applying to YC:

[Add your personalised insight here]

Would love to chat more about your approach. Reply to this email if you'd like feedback on your updated answers.

Best,
[Your Name]
YChecker`

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #EEEEEE',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium" style={{ color: '#111111' }}>
          {email}
        </p>
        <button
          onClick={() => setShowDraft(!showDraft)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
          style={{
            color: '#FF6B35',
            backgroundColor: '#FFF0E8',
            border: '1px solid #FFD4BC',
          }}
        >
          {showDraft ? 'Hide Draft' : 'Draft Follow-up'}
        </button>
      </div>
      <p className="text-xs" style={{ color: '#666666' }}>
        &ldquo;{app.one_liner}&rdquo;
      </p>
      {showDraft && (
        <textarea
          defaultValue={draft}
          rows={10}
          className="w-full mt-3 p-3 rounded-lg text-sm"
          style={{
            border: '1px solid #DDDDDD',
            color: '#333333',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      )}
    </div>
  )
}

/* ===================================================================
 * Badge Helpers
 * =================================================================== */
function getTierBadge(user: AdminUser) {
  const hasExpert = user.payments.some((p) => p.tier === 'expert')
  const hasAI = user.payments.some((p) => p.tier === 'ai')

  if (hasExpert)
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ backgroundColor: '#FFF0E8', color: '#FF6B35' }}
      >
        Expert
      </span>
    )
  if (hasAI)
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ backgroundColor: '#E8F5E9', color: '#1A7F4B' }}
      >
        AI
      </span>
    )
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: '#F5F5F5', color: '#AAAAAA' }}
    >
      Free
    </span>
  )
}

function getStatusBadge(app?: AdminApplication) {
  if (!app) return null

  const configs: Record<
    string,
    { label: string; bg: string; color: string }
  > = {
    expert_delivered: {
      label: 'Expert Delivered',
      bg: '#E8F5E9',
      color: '#1A7F4B',
    },
    expert_pending: {
      label: 'Expert Pending',
      bg: '#FFF0E8',
      color: '#FF6B35',
    },
    complete: { label: 'Complete', bg: '#F5F5F5', color: '#666666' },
    processing: { label: 'Processing', bg: '#FFF8E1', color: '#D68910' },
    pending: { label: 'Pending', bg: '#F5F5F5', color: '#AAAAAA' },
  }

  const config = configs[app.status] || configs.pending

  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  )
}
