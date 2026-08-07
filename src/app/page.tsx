import type { Metadata } from 'next'
import Link from 'next/link'
import {
  StatsStrip,
  SuccessCarousel,
  RejectionReality,
  FounderQuotes,
  HowItWorks,
} from '@/components/landing-sections'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'YChecker — Find Out If Your YC Application Would Get You Rejected',
  description:
    'Most YC applications get rejected in under 60 seconds. Find out if yours is one of them. Evaluated on the same criteria YC partners use.',
  keywords: [
    'Y Combinator',
    'YC application',
    'startup evaluation',
    'YC checker',
    'startup feedback',
    'YC application review',
  ],
}

/* ------------------------------------------------------------------
 * LANDING PAGE — Blueprint: YChecker_Landing_Page_Blueprint.md
 * Build order: Navbar → Hero → Stats → Carousel → Reality → Quotes
 *              → How It Works → Bottom CTA → Footer
 * ------------------------------------------------------------------ */
export default function Home() {
  return (
    <>
      {/* ===== 1. NAVBAR ===== */}
      <nav
        className="w-full sticky top-0 z-40 bg-white"
        style={{ borderBottom: '1px solid #DDDDDD' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="no-underline">
              <span
                className="text-2xl"
                style={{ fontWeight: 900, color: '#FF6B35' }}
              >
                YChecker
              </span>
            </Link>
            <Link
              href="/apply"
              className="no-underline text-white font-semibold"
              style={{
                backgroundColor: '#FF6B35',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                transition: 'background-color 150ms',
              }}
            >
              Check My Application
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ===== 2. HERO ===== */}
        <section style={{ paddingTop: 120, paddingBottom: 100 }}>
          <div className="mx-auto text-center px-4" style={{ maxWidth: 800 }}>
            {/* Eyebrow */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="mb-3"
                style={{ width: 24, height: 1, backgroundColor: '#FF6B35' }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#FF6B35',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                YCHECKER
              </span>
            </div>

            {/* Main headline */}
            <h1
              style={{
                fontWeight: 900,
                color: '#111111',
                lineHeight: 1.1,
                margin: 0,
              }}
              className="text-[44px] sm:text-[56px] md:text-[72px]"
            >
              Most YC applications
              <br />
              get rejected in under
              <br />
              60 seconds.
            </h1>

            {/* Sub-headline */}
            <p
              className="text-lg md:text-[22px]"
              style={{
                color: '#666666',
                marginTop: 24,
                fontWeight: 400,
              }}
            >
              Find out if yours is one of them.
            </p>

            {/* CTA button */}
            <div style={{ marginTop: 32 }}>
              <Link
                href="/apply"
                className="inline-block no-underline text-white"
                style={{
                  backgroundColor: '#FF6B35',
                  padding: '16px 40px',
                  borderRadius: 8,
                  fontSize: 18,
                  fontWeight: 600,
                  transition: 'background-color 150ms',
                }}
              >
                Check My Application
              </Link>
            </div>

            {/* Below CTA */}
            <p style={{ fontSize: 13, color: '#666666', marginTop: 20 }}>
              Free to start. No card required.
            </p>
          </div>
        </section>

        {/* ===== 3. STATS STRIP ===== */}
        <StatsStrip />

        {/* ===== 4. SUCCESS STORIES CAROUSEL ===== */}
        <SuccessCarousel />

        {/* ===== 5. WHAT REJECTION LOOKS LIKE ===== */}
        <RejectionReality />

        {/* ===== 6. FOUNDER WISDOM QUOTES ===== */}
        <FounderQuotes />

        {/* ===== 7. HOW IT WORKS ===== */}
        <HowItWorks />

        {/* ===== 8. BOTTOM CTA BAND ===== */}
        <section
          style={{
            borderTop: '1px solid #DDDDDD',
            padding: '80px 0',
          }}
        >
          <div
            className="mx-auto text-center px-4"
            style={{ maxWidth: 600 }}
          >
            <h2
              className="text-[28px] md:text-[40px]"
              style={{
                fontWeight: 700,
                color: '#111111',
                lineHeight: 1.2,
              }}
            >
              Your application is either strong
              <br />
              or it isn&apos;t. Find out now.
            </h2>

            <div style={{ marginTop: 32 }}>
              <Link
                href="/apply"
                className="inline-block no-underline text-white"
                style={{
                  backgroundColor: '#FF6B35',
                  padding: '16px 40px',
                  borderRadius: 8,
                  fontSize: 18,
                  fontWeight: 600,
                  transition: 'background-color 150ms',
                }}
              >
                Check My Application
              </Link>
            </div>

            <p style={{ fontSize: 13, color: '#666666', marginTop: 16 }}>
              Free to start. Results in under 60 seconds.
            </p>
          </div>
        </section>
      </main>

      {/* ===== 9. FOOTER ===== */}
      <Footer />
    </>
  )
}
