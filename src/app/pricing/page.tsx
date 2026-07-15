import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Pricing — YChecker',
  description:
    'YC gives accepted startups $500,000. Don\'t risk it on a weak application. Get your AI Report for $19.99 or Expert Review for $79.99.',
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Stakes Header — Blueprint Section 4.3 */}
        <section className="pt-16 md:pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1
              className="text-3xl sm:text-4xl font-black mb-3"
              style={{ color: '#111111' }}
            >
              YC gives accepted startups{' '}
              <span style={{ color: '#FF6B35' }}>$500,000</span>.
            </h1>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: '#666666' }}
            >
              The risk is $79.99. The reward is half a million dollars and the
              most powerful startup network in the world.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-16 md:pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Report */}
              <div className="card flex flex-col" style={{ border: '1px solid #DDDDDD' }}>
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-1" style={{ color: '#111111' }}>
                    AI Report
                  </h2>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black" style={{ color: '#FF6B35' }}>
                      $19.99
                    </span>
                    <span className="text-sm" style={{ color: '#666666' }}>
                      one-time
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#666666' }}>
                    Instant · Gemini AI (trained on YC criteria)
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Full 5-section breakdown',
                    'Blind spot detection',
                    'The Secret Score',
                    'Downloadable PDF',
                    'Personalised rewrite suggestions',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#111111' }}>
                      <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A7F4B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                  {[
                    'Expert commentary on each answer',
                    'Delivered to your email',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#CCCCCC' }}>
                      <span className="flex-shrink-0 mt-0.5 w-4 text-center">—</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/apply"
                  className="block text-center no-underline py-3 px-6 rounded-lg font-semibold text-base transition-colors duration-150 btn-secondary"
                >
                  Get My AI Report — $19.99
                </Link>
              </div>

              {/* Expert Review */}
              <div
                className="card relative flex flex-col"
                style={{ border: '2px solid #FF6B35' }}
              >
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  MOST POPULAR
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-1" style={{ color: '#111111' }}>
                    Expert Review
                  </h2>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black" style={{ color: '#FF6B35' }}>
                      $79.99
                    </span>
                    <span className="text-sm" style={{ color: '#666666' }}>
                      one-time
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#666666' }}>
                    Within 24–48 hours · AI + human expert review
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Full 5-section breakdown',
                    'Blind spot detection',
                    'The Secret Score',
                    'Downloadable PDF',
                    'Deeper, human-checked rewrite suggestions',
                    'Expert commentary on each answer',
                    'Delivered to your email',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#111111' }}>
                      <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A7F4B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/apply"
                  className="block text-center no-underline py-3 px-6 rounded-lg font-semibold text-base transition-colors duration-150 btn-primary"
                >
                  Get Expert Review — $79.99
                </Link>
              </div>
            </div>

            {/* Risk reframe — below Expert Review */}
            <p className="text-sm text-center mt-6 max-w-lg mx-auto" style={{ color: '#666666' }}>
              $79.99 is 0.016% of what YC gives you. If this report helps you get in,
              it&apos;s the highest-ROI $79.99 you&apos;ll ever spend.
            </p>

            {/* What happens after payment — Expert Review */}
            <div className="mt-10 text-center max-w-lg mx-auto">
              <p className="text-sm" style={{ color: '#666666' }}>
                <strong style={{ color: '#111111' }}>Expert Review process:</strong>{' '}
                After payment, your answers are reviewed by a human expert using
                AI with detailed YC evaluation instructions. You&apos;ll receive a full
                PDF report to your email within 24–48 hours.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
