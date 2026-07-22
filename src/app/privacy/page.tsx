import type { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — YChecker',
  description: 'How YChecker collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1
            className="text-2xl font-bold mb-6"
            style={{ color: '#111111' }}
          >
            Privacy Policy
          </h1>
          <p className="text-xs mb-8" style={{ color: '#AAAAAA' }}>
            Last updated: July 2026
          </p>

          <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#333333' }}>
            <section>
              <h2 className="text-base font-semibold mb-2" style={{ color: '#111111' }}>
                1. What We Collect
              </h2>
              <p>When you use YChecker, we collect:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Account information:</strong> Your email address and
                  authentication credentials (password hash or Google OAuth
                  token).
                </li>
                <li>
                  <strong>Application answers:</strong> The 5 text responses you
                  submit through the evaluation form (one-liner, problem,
                  traction, team, competitors).
                </li>
                <li>
                  <strong>Evaluation reports:</strong> The AI-generated report
                  including scores, feedback, and rewrite suggestions.
                </li>
                <li>
                  <strong>Payment information:</strong> Transaction records
                  (order ID, payment ID, amount, tier). We do not store your
                  card details — all payment processing is handled by Razorpay.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2" style={{ color: '#111111' }}>
                2. How We Use Your Data
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To generate your AI evaluation report.</li>
                <li>To send transactional emails (welcome, report ready, payment confirmation).</li>
                <li>To display your dashboard and account information.</li>
                <li>To process payments securely via Razorpay.</li>
              </ul>
              <p className="mt-2">
                We <strong>never</strong> share, sell, or log your application
                answers to any external analytics, advertising, or third-party
                service. Your application content is sent only to Google&apos;s
                Gemini API for evaluation and is not used for model training.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2" style={{ color: '#111111' }}>
                3. Data Storage & Security
              </h2>
              <p>
                All data is stored in Supabase (hosted on AWS) with Row Level
                Security (RLS) enabled. Each user can only access their own
                data. API keys are stored as server-side environment variables
                and are never exposed to the browser.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2" style={{ color: '#111111' }}>
                4. Data Deletion
              </h2>
              <p>
                You can permanently delete your account and all associated data
                (applications, reports, payment records) at any time from the{' '}
                <a href="/account" style={{ color: '#FF6B35' }}>
                  Account
                </a>{' '}
                page. This action is immediate and irreversible.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2" style={{ color: '#111111' }}>
                5. Third-Party Services
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Supabase:</strong> Database, authentication, and file
                  storage.
                </li>
                <li>
                  <strong>Google Gemini API:</strong> AI evaluation of your
                  application answers.
                </li>
                <li>
                  <strong>Razorpay:</strong> Payment processing (PCI DSS
                  compliant).
                </li>
                <li>
                  <strong>Resend:</strong> Transactional email delivery.
                </li>
                <li>
                  <strong>Vercel:</strong> Application hosting.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2" style={{ color: '#111111' }}>
                6. Cookies
              </h2>
              <p>
                We use essential cookies only for authentication session
                management (Supabase auth cookies). We do not use advertising or
                tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2" style={{ color: '#111111' }}>
                7. Contact
              </h2>
              <p>
                For privacy-related questions, contact us at{' '}
                <a
                  href="mailto:kushagraceo17@gmail.com"
                  style={{ color: '#FF6B35' }}
                >
                  kushagraceo17@gmail.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
