'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/* ===================================================================
 * Shared fade-in animation variant for sections
 * =================================================================== */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

/* ===================================================================
 * Section Label — orange uppercase label with optional centered line
 * =================================================================== */
function SectionLabel({ text, withLine }: { text: string; withLine?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      {withLine && (
        <div
          className="mb-3"
          style={{ width: 24, height: 1, backgroundColor: '#FF6B35' }}
        />
      )}
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#FF6B35',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.12em',
        }}
      >
        {text}
      </span>
    </div>
  )
}

/* ===================================================================
 * SUCCESS STORIES CAROUSEL — Section 4
 * Auto-scrolling, pauses on hover, infinite loop
 * =================================================================== */
const companies = [
  { name: 'Airbnb', outcome: 'Started in W09. Went public in 2020.', badge: '$100B+ valuation' },
  { name: 'Stripe', outcome: 'Started in S09. Now the internet\'s payments backbone.', badge: '$107B valuation' },
  { name: 'Dropbox', outcome: 'Started in S07. Biggest tech IPO of 2018.', badge: '$9B valuation' },
  { name: 'DoorDash', outcome: 'Started in S13. Went public in 2020.', badge: '$39B valuation' },
  { name: 'Coinbase', outcome: 'Started in S12. Went public in 2021.', badge: '$86B valuation' },
  { name: 'OpenAI', outcome: 'Founded as YC Research in 2015.', badge: '$500B+ valuation' },
  { name: 'GitLab', outcome: 'Started in S14. Went public in 2021.', badge: '$11B valuation' },
  { name: 'Reddit', outcome: 'Started in S05. Went public in 2024.', badge: '$6.4B valuation' },
]

export function SuccessCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const posRef = useRef(0)
  const pausedRef = useRef(false)

  // Duplicate cards for seamless infinite loop
  const cards = [...companies, ...companies]
  const cardWidth = 280 + 24 // card width + gap
  const totalWidth = companies.length * cardWidth

  useEffect(() => {
    const animate = () => {
      if (!pausedRef.current) {
        posRef.current -= 0.5
        if (Math.abs(posRef.current) >= totalWidth) {
          posRef.current = 0
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${posRef.current}px)`
        }
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [totalWidth])

  return (
    <motion.section
      className="py-16 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={fadeInUp}
    >
      <div className="text-center mb-12">
        <SectionLabel text="WHERE YOUR APPLICATION COULD TAKE YOU" />
        <h2
          className="mt-4"
          style={{ fontSize: 36, fontWeight: 700, color: '#111111' }}
        >
          These started as applications.
        </h2>
      </div>

      <div
        className="overflow-hidden"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{ gap: 24, willChange: 'transform' }}
        >
          {cards.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="flex-shrink-0 transition-shadow duration-150"
              style={{
                width: 280,
                padding: 32,
                backgroundColor: '#FFFFFF',
                border: '1px solid #DDDDDD',
                borderRadius: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111111', marginBottom: 8 }}>
                {c.name}
              </div>
              <div style={{ fontSize: 15, fontWeight: 400, color: '#666666', marginBottom: 16, lineHeight: 1.5 }}>
                {c.outcome}
              </div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 100,
                  backgroundColor: '#FFF0E8',
                  color: '#FF6B35',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {c.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/* ===================================================================
 * REJECTION REALITY CARDS — Section 5
 * =================================================================== */
const rejectionCards = [
  {
    label: 'THE FLUFF PROBLEM',
    body: 'Most applications written with ChatGPT sound identical. Vague language. No numbers. No specificity. Partners stop reading after the first paragraph.',
  },
  {
    label: 'THE BLIND SPOT PROBLEM',
    body: 'Founders are too close to their own idea. They explain what it does, not why it wins. YC partners spot this in seconds.',
  },
  {
    label: 'THE TRACTION PROBLEM',
    body: "Saying 'we plan to reach 10,000 users' is not traction. One paying customer who renewed is. Most applications confuse ambition with evidence.",
  },
]

export function RejectionReality() {
  return (
    <motion.section
      className="py-16 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={fadeInUp}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionLabel text="THE REALITY" />
          <h2
            className="mt-4 mx-auto"
            style={{ fontSize: 40, fontWeight: 700, color: '#111111', maxWidth: 640, lineHeight: 1.2 }}
          >
            YC rejects 98% of applications.
            <br className="hidden sm:block" />
            Here&apos;s why most of them deserved it.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rejectionCards.map((card) => (
            <div
              key={card.label}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #DDDDDD',
                borderRadius: 8,
                padding: 28,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#FF6B35',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}
              >
                {card.label}
              </div>
              <p style={{ fontSize: 15, fontWeight: 400, color: '#666666', lineHeight: 1.7, margin: 0 }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/* ===================================================================
 * FOUNDER WISDOM QUOTES — Section 6
 * =================================================================== */
const quotes = [
  {
    text: 'The most important thing is to be very clear about what you do and why. Vague is the enemy of funded.',
    attribution: 'Paul Graham, Y Combinator',
  },
  {
    text: 'Ideas are easy. Execution is everything. A strong application shows you already know the difference.',
    attribution: 'John Doerr, Kleiner Perkins',
  },
  {
    text: "The founders who get in aren't the ones with the best ideas. They're the ones who understand their idea more deeply than anyone else in the room.",
    attribution: 'Sam Altman, OpenAI / Y Combinator',
  },
]

export function FounderQuotes() {
  return (
    <motion.section
      className="py-16 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={fadeInUp}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionLabel text="IN THEIR WORDS" />
          <h2
            className="mt-4 mx-auto"
            style={{ fontSize: 36, fontWeight: 700, color: '#111111', maxWidth: 560 }}
          >
            What the people who built billion-dollar companies say about being prepared.
          </h2>
        </div>

        <div className="flex flex-col gap-8 mx-auto" style={{ maxWidth: 680 }}>
          {quotes.map((q) => (
            <div
              key={q.attribution}
              style={{
                borderLeft: '3px solid #FF6B35',
                paddingLeft: 24,
              }}
            >
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 400,
                  color: '#111111',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                &ldquo;{q.text}&rdquo;
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#666666',
                  marginTop: 16,
                  fontStyle: 'normal',
                }}
              >
                — {q.attribution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/* ===================================================================
 * HOW IT WORKS — Section 7
 * =================================================================== */
const steps = [
  {
    number: '1',
    title: 'Paste Your Answers',
    body: 'Copy your YC application answers directly into our form. Five questions. Takes under ten minutes.',
  },
  {
    number: '2',
    title: 'Get Evaluated Like a Partner Would',
    body: 'Our AI evaluates every answer on the same criteria YC partners use — clarity, traction, team risk, market size, and unique insight.',
  },
  {
    number: '3',
    title: 'Know Exactly What to Fix',
    body: 'You receive a scored report with specific weaknesses, fluff flags, blind spots you missed, and rewrite suggestions for every section.',
  },
]

export function HowItWorks() {
  return (
    <motion.section
      className="py-16 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={fadeInUp}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionLabel text="THE PROCESS" />
          <h2
            className="mt-4"
            style={{ fontSize: 36, fontWeight: 700, color: '#111111' }}
          >
            Three steps. Ten minutes.
            <br />
            The truth about your application.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center md:text-left">
              <div style={{ fontSize: 48, fontWeight: 900, color: '#FF6B35' }}>
                {step.number}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111111', marginTop: 12 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 15, fontWeight: 400, color: '#666666', lineHeight: 1.6, marginTop: 8 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/apply"
            className="inline-block no-underline text-white font-semibold"
            style={{
              backgroundColor: '#FF6B35',
              padding: '16px 40px',
              borderRadius: 8,
              fontSize: 18,
              transition: 'background-color 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E55A2B'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FF6B35'
            }}
          >
            Check My Application
          </a>
          <p style={{ fontSize: 13, color: '#666666', marginTop: 16 }}>
            Evaluated. Scored. Specific. Not encouragement.
          </p>
        </div>
      </div>
    </motion.section>
  )
}

/* ===================================================================
 * STATS STRIP — Section 3 (client wrapper for Suspense data)
 * =================================================================== */
export function StatsStrip({
  stats,
}: {
  stats: { applicationsEvaluated: number; criticalWeaknesses: number; fluffFlagsDetected: number }
}) {
  return (
    <div
      style={{
        borderTop: '1px solid #DDDDDD',
        borderBottom: '1px solid #DDDDDD',
        padding: '40px 0',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#1A7F4B' }}>
              {stats.applicationsEvaluated.toLocaleString() || '—'}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#666666',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                marginTop: 4,
              }}
            >
              Applications Evaluated
            </div>
          </div>
          <div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#1A7F4B' }}>
              {stats.criticalWeaknesses.toLocaleString() || '—'}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#666666',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                marginTop: 4,
              }}
            >
              Critical Weaknesses Found
            </div>
          </div>
          <div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#1A7F4B' }}>
              {stats.fluffFlagsDetected.toLocaleString() || '—'}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#666666',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                marginTop: 4,
              }}
            >
              Fluff Flags Detected
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
