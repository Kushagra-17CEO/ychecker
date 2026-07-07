'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

/* ===================================================================
 * SocialProofCounter — Live application count from the database
 * Shows "X applications evaluated this week" — real data only.
 * Animated count-up effect for engagement.
 * =================================================================== */
export function SocialProofCounter({ count }: { count: number }) {
  const [displayed, setDisplayed] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (count === 0 || hasAnimated.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          // Animate the count up
          const duration = 1200 // ms
          const start = performance.now()
          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out curve
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayed(Math.round(eased * count))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [count])

  // Only show when we have real data
  if (count === 0) return null

  return (
    <div
      ref={ref}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
      style={{
        backgroundColor: '#FFF0E8',
        color: '#FF6B35',
        border: '1px solid #FFD4BC',
      }}
    >
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
          style={{ backgroundColor: '#FF6B35' }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: '#FF6B35' }}
        />
      </span>
      <span>
        <strong>{displayed.toLocaleString()}</strong> applications evaluated this week
      </span>
    </div>
  )
}

/* ===================================================================
 * StepCard — Single card in the 3-step explainer section
 * =================================================================== */
interface StepCardProps {
  number: number
  title: string
  description: string
  icon: 'edit' | 'brain' | 'report'
}

const stepIcons = {
  edit: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  brain: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.5.5 2.9 1.4 4L12 22l6.6-10.5c.9-1.1 1.4-2.5 1.4-4A5.5 5.5 0 0 0 14.5 2 5.5 5.5 0 0 0 12 2.8 5.5 5.5 0 0 0 9.5 2z" />
      <circle cx="12" cy="8" r="2" />
    </svg>
  ),
  report: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
}

export function StepCard({ number, title, description, icon }: StepCardProps) {
  return (
    <div className="card text-center group hover:shadow-md transition-shadow duration-200">
      {/* Step number badge */}
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 text-white text-lg font-bold"
        style={{ backgroundColor: '#FF6B35' }}
      >
        {number}
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-3">
        {stepIcons[icon]}
      </div>

      {/* Content */}
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: '#111111' }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: '#666666' }}
      >
        {description}
      </p>
    </div>
  )
}

/* ===================================================================
 * PricingCard — AI Report or Expert Review card
 * =================================================================== */
interface PricingCardProps {
  tier: 'ai' | 'expert'
  title: string
  price: string
  turnaround: string
  reviewer: string
  features: string[]
  ctaText: string
  ctaHref: string
  highlighted?: boolean
}

export function PricingCard({
  title,
  price,
  turnaround,
  reviewer,
  features,
  ctaText,
  ctaHref,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className="card relative flex flex-col"
      style={{
        border: highlighted
          ? '2px solid #FF6B35'
          : '1px solid #DDDDDD',
      }}
    >
      {/* Popular badge for Expert Review */}
      {highlighted && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: '#FF6B35' }}
        >
          MOST POPULAR
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3
          className="text-xl font-bold mb-1"
          style={{ color: '#111111' }}
        >
          {title}
        </h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span
            className="text-3xl font-black"
            style={{ color: '#FF6B35' }}
          >
            {price}
          </span>
          <span
            className="text-sm"
            style={{ color: '#666666' }}
          >
            one-time
          </span>
        </div>
        <p
          className="text-sm"
          style={{ color: '#666666' }}
        >
          {turnaround} · {reviewer}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm"
            style={{ color: '#111111' }}
          >
            <svg
              className="flex-shrink-0 mt-0.5"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1A7F4B"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={ctaHref}
        className={`block text-center no-underline py-3 px-6 rounded-lg font-semibold text-base transition-colors duration-150 ${
          highlighted
            ? 'btn-primary'
            : 'btn-secondary'
        }`}
      >
        {ctaText}
      </Link>
    </div>
  )
}

/* ===================================================================
 * HeroAnimation — Subtle floating accent shapes behind hero
 * =================================================================== */
export function HeroAnimation() {
  return (
    <div className="relative mt-12 flex justify-center" aria-hidden="true">
      {/* Animated underline accent */}
      <div className="relative">
        <div
          className="h-1 rounded-full animate-pulse"
          style={{
            backgroundColor: '#FF6B35',
            width: '120px',
            opacity: 0.4,
          }}
        />
      </div>
    </div>
  )
}
