import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getWeeklyApplicationCount } from '@/lib/queries'
import { HeroAnimation, StepCard, PricingCard, SocialProofCounter } from '@/components/landing-sections'

export const metadata: Metadata = {
  title: 'YChecker — Find Out If Your YC Application Would Get You Rejected',
  description:
    'Evaluated by AI trained on real YC partner criteria. No fluff. No encouragement. Just the truth. Get a structured report judging your application exactly the way a YC partner would.',
  keywords: [
    'Y Combinator',
    'YC application',
    'startup evaluation',
    'YC checker',
    'startup feedback',
    'YC application review',
  ],
}

export default async function Home() {
  const weeklyCount = await getWeeklyApplicationCount()

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden">
          {/* Subtle background accent */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ backgroundColor: '#FF6B35' }}
          />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
            {/* Hero headline — loss-framed per blueprint psychology note */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6"
              style={{ color: '#111111' }}
            >
              Find Out If Your YC Application{' '}
              <span style={{ color: '#FF6B35' }}>Would Get You Rejected</span>
            </h1>

            {/* Sub-headline */}
            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
              style={{ color: '#666666' }}
            >
              Evaluated by AI trained on real YC partner criteria. No fluff. No encouragement. Just the truth.
            </p>

            {/* Social proof counter — real, live count from database */}
            <SocialProofCounter count={weeklyCount} />

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/apply"
                className="btn-primary text-lg px-8 py-4 no-underline inline-flex items-center gap-2"
              >
                Check My Application
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="btn-secondary text-base px-6 py-3 no-underline"
              >
                See Pricing
              </Link>
            </div>

            {/* Animated accent */}
            <HeroAnimation />
          </div>
        </section>

        {/* ===== 3-STEP EXPLAINER ===== */}
        <section
          className="py-16 md:py-24"
          style={{ backgroundColor: '#FAFAFA' }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-2xl sm:text-3xl font-semibold text-center mb-4"
              style={{ color: '#FF6B35' }}
            >
              How It Works
            </h2>
            <p
              className="text-base text-center max-w-xl mx-auto mb-12"
              style={{ color: '#666666' }}
            >
              Three steps between you and the brutal truth about your application.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                number={1}
                title="Paste Your Answers"
                description="Fill in the 5 hardest YC application questions — one-liner, problem, traction, team, and competitors."
                icon="edit"
              />
              <StepCard
                number={2}
                title="Evaluated Like a YC Partner"
                description="Our AI scores every answer on clarity, traction, team risk, market size, and unique insight — exactly like a real partner would."
                icon="brain"
              />
              <StepCard
                number={3}
                title="Get Brutal, Actionable Feedback"
                description="Receive a structured report with scores, strengths, weaknesses, fluff flags, blind spots, and specific rewrite suggestions."
                icon="report"
              />
            </div>
          </div>
        </section>

        {/* ===== WHAT YOU GET ===== */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-2xl sm:text-3xl font-semibold text-center mb-4"
              style={{ color: '#FF6B35' }}
            >
              What Your Report Includes
            </h2>
            <p
              className="text-base text-center max-w-xl mx-auto mb-12"
              style={{ color: '#666666' }}
            >
              Every weakness a YC partner would catch — before they see your application.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Overall Score',
                  desc: 'A single number from 1–100 telling you exactly where you stand.',
                  emoji: '🎯',
                },
                {
                  title: '5-Section Breakdown',
                  desc: 'Each answer scored on clarity, traction, and specificity with per-section feedback.',
                  emoji: '📊',
                },
                {
                  title: 'Fluff Detection',
                  desc: 'Every buzzword, cliché, and vague phrase flagged — the exact phrases YC hates.',
                  emoji: '🚩',
                },
                {
                  title: 'Blind Spot Analysis',
                  desc: 'Risks and gaps you haven\'t considered that a YC partner would immediately notice.',
                  emoji: '🔍',
                },
                {
                  title: 'Rewrite Suggestions',
                  desc: 'Specific, actionable rewrites for each answer — not generic advice.',
                  emoji: '✏️',
                },
                {
                  title: 'The Secret Score',
                  desc: 'Do you have a non-obvious insight that competitors are missing? We\'ll tell you.',
                  emoji: '💡',
                },
              ].map((item) => (
                <div key={item.title} className="card group hover:shadow-md transition-shadow duration-200">
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: '#111111' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: '#666666' }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING PREVIEW ===== */}
        <section
          className="py-16 md:py-24"
          style={{ backgroundColor: '#FAFAFA' }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Stakes header — anchoring $500k per blueprint */}
            <div className="text-center mb-12">
              <h2
                className="text-2xl sm:text-3xl font-bold mb-3"
                style={{ color: '#111111' }}
              >
                YC gives accepted startups{' '}
                <span style={{ color: '#FF6B35' }}>$500,000</span>.
              </h2>
              <p
                className="text-base max-w-lg mx-auto"
                style={{ color: '#666666' }}
              >
                Don&apos;t risk it on a weak application. Know exactly where you stand before you hit Submit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PricingCard
                tier="ai"
                title="AI Report"
                price="$19.99"
                turnaround="Instant"
                reviewer="Gemini AI (trained on YC criteria)"
                features={[
                  'Full 5-section breakdown',
                  'Blind spot detection',
                  'The Secret Score',
                  'Downloadable PDF',
                  'Personalised rewrite suggestions',
                ]}
                ctaText="Get My AI Report — $19.99"
                ctaHref="/apply"
              />
              <PricingCard
                tier="expert"
                title="Expert Review"
                price="$79.99"
                turnaround="Within 24–48 hours"
                reviewer="AI + human expert review"
                features={[
                  'Full 5-section breakdown',
                  'Blind spot detection',
                  'The Secret Score',
                  'Downloadable PDF',
                  'Deeper, human-checked rewrite suggestions',
                  'Expert commentary on each answer',
                  'Delivered to your email',
                ]}
                ctaText="Get Expert Review — $79.99"
                ctaHref="/apply"
                highlighted
              />
            </div>

            {/* Risk reframe — below Expert Review card */}
            <p
              className="text-sm text-center mt-6 max-w-lg mx-auto"
              style={{ color: '#666666' }}
            >
              $79.99 is 0.016% of what YC gives you. If this report helps you get in,
              it&apos;s the highest-ROI $79.99 you&apos;ll ever spend.
            </p>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: '#111111' }}
            >
              Stop guessing.{' '}
              <span style={{ color: '#FF6B35' }}>Start knowing.</span>
            </h2>
            <p
              className="text-lg mb-8"
              style={{ color: '#666666' }}
            >
              Your application is either ready or it isn&apos;t. Find out in 60 seconds.
            </p>
            <Link
              href="/apply"
              className="btn-primary text-lg px-10 py-4 no-underline inline-flex items-center gap-2"
            >
              Check My Application
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
