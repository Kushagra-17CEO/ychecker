import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import DeleteAccountButton from './delete-account-button'

export const metadata: Metadata = {
  title: 'Account — YChecker',
  description: 'Manage your YChecker account settings.',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/account')
  }

  // Get payment history to determine plan status
  const { data: payments } = await supabase
    .from('payments')
    .select('tier, status, created_at')
    .eq('user_id', user.id)
    .eq('status', 'complete')
    .order('created_at', { ascending: false })

  const completedPayments = payments || []
  const hasExpert = completedPayments.some((p) => p.tier === 'expert')
  const hasAI = completedPayments.some((p) => p.tier === 'ai')

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1
            className="text-2xl font-bold mb-8"
            style={{ color: '#111111' }}
          >
            Account
          </h1>

          {/* Email */}
          <section
            className="rounded-xl p-6 mb-6"
            style={{ border: '1px solid #EEEEEE' }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: '#666666' }}
            >
              Email
            </h2>
            <p className="text-base font-medium" style={{ color: '#111111' }}>
              {user.email}
            </p>
            {user.app_metadata?.provider && (
              <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
                Signed in via{' '}
                {user.app_metadata.provider === 'google'
                  ? 'Google'
                  : 'Email & Password'}
              </p>
            )}
          </section>

          {/* Plan / Purchase History */}
          <section
            className="rounded-xl p-6 mb-6"
            style={{ border: '1px solid #EEEEEE' }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: '#666666' }}
            >
              Purchase History
            </h2>
            {completedPayments.length === 0 ? (
              <p className="text-sm" style={{ color: '#AAAAAA' }}>
                No purchases yet.
              </p>
            ) : (
              <div className="space-y-3">
                {hasExpert && (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: '#FFF0E8',
                        color: '#FF6B35',
                      }}
                    >
                      Expert Review
                    </span>
                    <span className="text-sm" style={{ color: '#666666' }}>
                      Purchased
                    </span>
                  </div>
                )}
                {hasAI && (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: '#E8F5E9',
                        color: '#1A7F4B',
                      }}
                    >
                      AI Report
                    </span>
                    <span className="text-sm" style={{ color: '#666666' }}>
                      Purchased
                    </span>
                  </div>
                )}
                <p className="text-xs mt-2" style={{ color: '#AAAAAA' }}>
                  {completedPayments.length} total purchase
                  {completedPayments.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
            <p className="text-xs mt-4" style={{ color: '#666666' }}>
              For billing inquiries, contact{' '}
              <a
                href="mailto:kushagraceo17@gmail.com"
                style={{ color: '#FF6B35' }}
              >
                support
              </a>
              .
            </p>
          </section>

          {/* Danger Zone */}
          <section
            className="rounded-xl p-6"
            style={{ border: '1px solid #FFCDD2' }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: '#C0392B' }}
            >
              Danger Zone
            </h2>
            <p className="text-sm mb-4" style={{ color: '#666666' }}>
              Permanently delete your account and all associated data
              (applications, reports, payments). This action cannot be undone.
            </p>
            <DeleteAccountButton />
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
