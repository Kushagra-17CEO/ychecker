'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getScoreColor, SCORE_COLORS } from '@/lib/types'
import type { SectionEvaluation } from '@/lib/types'

/* ===================================================================
 * Types for API response
 * =================================================================== */
interface TeaserData {
  obscured_score: string
  weakness_count: number
  strength_count: number
  first_finding: string | null
  section_labels: { key: string; label: string; score: number }[]
  verdict_preview: string | null
}

interface UnlockedData {
  overall_score: number
  verdict: string
  sections: Record<string, SectionEvaluation>
  strengths: string[]
  weaknesses: string[]
  fluff_flags: string[]
  blind_spots: string[]
  rewrite_suggestions: Record<string, string>
  the_secret_score: number
  the_secret_explanation: string
  pdf_url: string | null
  created_at: string
}

interface ReportResponse {
  id: string
  is_unlocked: boolean
  teaser?: TeaserData
  overall_score?: number
  verdict?: string
  sections?: Record<string, SectionEvaluation>
  strengths?: string[]
  weaknesses?: string[]
  fluff_flags?: string[]
  blind_spots?: string[]
  rewrite_suggestions?: Record<string, string>
  the_secret_score?: number
  the_secret_explanation?: string
  pdf_url?: string | null
  created_at?: string
}

const SECTION_LABELS: Record<string, string> = {
  one_liner: 'One-Liner',
  problem: 'Problem & Solution',
  traction: 'Traction & Metrics',
  team: 'Team & Founder-Market Fit',
  competitors: 'Competitor Landscape',
}

/* ===================================================================
 * Main Report View Component
 * =================================================================== */
export default function ReportView({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/report/${reportId}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load report')
        }
        const data = await res.json()
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [reportId])

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: '#FF6B35' }}>
            YChecker
          </h1>
          <p className="text-sm" style={{ color: '#666666' }}>Loading your report...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#111111' }}>
              Report Not Found
            </h1>
            <p className="text-base mb-6" style={{ color: '#666666' }}>
              {error || 'This report doesn\'t exist or you don\'t have access to it.'}
            </p>
            <Link href="/apply" className="btn-primary no-underline">
              Check My Application
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Render teaser or full report
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {report.is_unlocked ? (
            <UnlockedReport report={report as ReportResponse & UnlockedData} expandedSections={expandedSections} toggleSection={toggleSection} />
          ) : (
            <TeaserReport teaser={report.teaser!} reportId={reportId} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

/* ===================================================================
 * TEASER REPORT — Locked, paywall view (Blueprint Section 4.3)
 * =================================================================== */
function TeaserReport({ teaser, reportId }: { teaser: TeaserData; reportId: string }) {
  return (
    <div>
      {/* Partially obscured score */}
      <div className="text-center mb-8">
        <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#FF6B35' }}>
          Your Score
        </p>
        <div className="inline-flex items-baseline gap-1">
          <span className="text-7xl font-black" style={{ color: '#111111' }}>
            {teaser.obscured_score.charAt(0)}
          </span>
          <span
            className="text-7xl font-black"
            style={{
              color: '#DDDDDD',
              filter: 'blur(8px)',
              userSelect: 'none',
            }}
          >
            _
          </span>
          <span className="text-2xl font-medium ml-1" style={{ color: '#666666' }}>
            / 100
          </span>
        </div>
      </div>

      {/* Sneak peek finding — Barnum Effect hook */}
      {teaser.first_finding && (
        <div
          className="card mb-8 text-center"
          style={{ borderColor: '#FF6B35', borderWidth: '2px' }}
        >
          <p className="text-base font-semibold" style={{ color: '#111111' }}>
            {teaser.first_finding}
          </p>
          <p className="text-sm mt-2" style={{ color: '#666666' }}>
            Unlock the full report to see the details.
          </p>
        </div>
      )}

      {/* Verdict preview (truncated) */}
      {teaser.verdict_preview && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#111111' }}>
            The Verdict
          </h2>
          <div className="relative">
            <p className="text-base" style={{ color: '#666666' }}>
              {teaser.verdict_preview}
            </p>
            <div
              className="absolute inset-0 top-1/2"
              style={{
                background: 'linear-gradient(to bottom, transparent, white)',
              }}
            />
          </div>
        </div>
      )}

      {/* Locked section cards — visible labels, blurred content */}
      <div className="space-y-4 mb-10">
        <h2 className="text-lg font-semibold" style={{ color: '#111111' }}>
          Section Breakdown
        </h2>
        {teaser.section_labels.map((section) => (
          <div
            key={section.key}
            className="card relative overflow-hidden"
            style={{ borderColor: '#DDDDDD' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold" style={{ color: '#111111' }}>
                {section.label}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: '#666666', filter: 'blur(4px)', userSelect: 'none' }}
                >
                  {section.score}/10
                </span>
                {/* Lock icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6B35"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
            {/* Blurred placeholder content */}
            <div style={{ filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }}>
              <p className="text-sm mb-1" style={{ color: '#1A7F4B' }}>
                ✓ Strong signal detected in this section
              </p>
              <p className="text-sm mb-1" style={{ color: '#C0392B' }}>
                ✗ Critical weakness identified — click to unlock feedback
              </p>
              <p className="text-sm" style={{ color: '#D68910' }}>
                ⚠ Fluff phrase detected — rewrite suggestion available
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Locked Blind Spots */}
      <div className="card mb-4 relative overflow-hidden" style={{ borderColor: '#DDDDDD' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold" style={{ color: '#111111' }}>
            Blind Spots
          </h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div style={{ filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }}>
          <p className="text-sm" style={{ color: '#666666' }}>Hidden risks the founder hasn&apos;t considered</p>
        </div>
      </div>

      {/* Locked Secret Score */}
      <div className="card mb-10 relative overflow-hidden" style={{ borderColor: '#DDDDDD' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold" style={{ color: '#111111' }}>
            The Secret Score
          </h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div style={{ filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }}>
          <p className="text-sm" style={{ color: '#666666' }}>Do you have a non-obvious insight?</p>
        </div>
      </div>

      {/* $500k Stakes Anchor + Unlock CTAs */}
      <div className="text-center py-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#111111' }}>
          YC gives accepted startups{' '}
          <span style={{ color: '#FF6B35' }}>$500,000</span>.
        </h2>
        <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: '#666666' }}>
          Don&apos;t risk it on a weak application. See exactly what a YC partner would flag.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/checkout?report=${reportId}&tier=ai`}
            className="btn-secondary text-base px-6 py-3 no-underline"
          >
            Unlock My AI Report — $19.99
          </Link>
          <Link
            href={`/checkout?report=${reportId}&tier=expert`}
            className="btn-primary text-base px-6 py-3 no-underline"
          >
            Get Expert Review — $79.99
          </Link>
        </div>

        <p className="text-sm mt-4 max-w-md mx-auto" style={{ color: '#666666' }}>
          $79.99 is 0.016% of what YC gives you. If this report helps you get in,
          it&apos;s the highest-ROI $79.99 you&apos;ll ever spend.
        </p>
      </div>
    </div>
  )
}

/* ===================================================================
 * UNLOCKED REPORT — Full view (Blueprint Section 4.3)
 * =================================================================== */
function UnlockedReport({
  report,
  expandedSections,
  toggleSection,
}: {
  report: ReportResponse & Partial<UnlockedData>
  expandedSections: Set<string>
  toggleSection: (key: string) => void
}) {
  const score = report.overall_score || 0
  const scoreColor = getScoreColor(score)
  const colorHex = SCORE_COLORS[scoreColor]

  return (
    <div>
      {/* Overall Score Badge */}
      <div className="text-center mb-8">
        <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#FF6B35' }}>
          Your Score
        </p>
        <div
          className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-3"
          style={{ border: `4px solid ${colorHex}` }}
        >
          <span className="text-4xl font-black" style={{ color: colorHex }}>
            {score}
          </span>
        </div>
        <p className="text-sm font-medium" style={{ color: colorHex }}>
          {score < 50 ? 'Needs Major Work' : score < 75 ? 'Getting There' : 'Strong Application'}
        </p>
      </div>

      {/* Verdict */}
      {report.verdict && (
        <div className="card mb-8" style={{ borderLeft: `4px solid ${colorHex}` }}>
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#111111' }}>
            The Verdict
          </h2>
          <p className="text-base leading-relaxed" style={{ color: '#333333' }}>
            {report.verdict}
          </p>
        </div>
      )}

      {/* Section Breakdown — Collapsible cards */}
      {report.sections && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold" style={{ color: '#111111' }}>
            Section Breakdown
          </h2>
          {Object.entries(report.sections).map(([key, section]) => {
            const isExpanded = expandedSections.has(key)
            const sectionColor = SCORE_COLORS[getScoreColor(section.score * 10)]

            return (
              <div key={key} className="card" style={{ borderColor: '#DDDDDD' }}>
                {/* Header — clickable to toggle */}
                <button
                  type="button"
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer p-0 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-lg text-white text-sm font-bold"
                      style={{ backgroundColor: sectionColor }}
                    >
                      {section.score}
                    </div>
                    <h3 className="text-base font-semibold" style={{ color: '#111111' }}>
                      {SECTION_LABELS[key] || key}
                    </h3>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#666666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid #EEEEEE' }}>
                    {/* Strengths */}
                    {section.strengths?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#1A7F4B' }}>
                          Strengths
                        </p>
                        <ul className="space-y-1">
                          {section.strengths.map((s, i) => (
                            <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#333333' }}>
                              <span style={{ color: '#1A7F4B' }}>✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {section.weaknesses?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#C0392B' }}>
                          Weaknesses
                        </p>
                        <ul className="space-y-1">
                          {section.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#333333' }}>
                              <span style={{ color: '#C0392B' }}>✗</span> {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Fluff Flags */}
                    {section.fluff_flags?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#D68910' }}>
                          Fluff Detected
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {section.fluff_flags.map((f, i) => (
                            <span
                              key={i}
                              className="inline-block text-xs px-2 py-1 rounded-full font-medium"
                              style={{
                                backgroundColor: '#FFF8E1',
                                color: '#D68910',
                                border: '1px solid #D68910',
                              }}
                            >
                              &ldquo;{f}&rdquo;
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rewrite Suggestion */}
                    {section.rewrite_suggestion && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#FF6B35' }}>
                          Rewrite Suggestion
                        </p>
                        <div
                          className="text-sm p-3 rounded-lg leading-relaxed"
                          style={{ backgroundColor: '#FFF0E8', color: '#333333' }}
                        >
                          {section.rewrite_suggestion}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Blind Spots */}
      {report.blind_spots && report.blind_spots.length > 0 && (
        <div className="card mb-8" style={{ borderColor: '#C0392B', borderLeftWidth: '4px' }}>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>
            🔍 Blind Spots
          </h2>
          <p className="text-sm mb-3" style={{ color: '#666666' }}>
            Risks and gaps you haven&apos;t addressed that a YC partner would immediately notice.
          </p>
          <ul className="space-y-2">
            {report.blind_spots.map((spot, i) => (
              <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#333333' }}>
                <span style={{ color: '#C0392B' }}>⚠</span> {spot}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The Secret Score */}
      {report.the_secret_score !== undefined && (
        <div
          className="card mb-8"
          style={{
            borderColor: '#FF6B35',
            borderLeftWidth: '4px',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-semibold" style={{ color: '#111111' }}>
              💡 The Secret Score
            </h2>
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold"
              style={{
                backgroundColor: SCORE_COLORS[getScoreColor(report.the_secret_score * 10)],
              }}
            >
              {report.the_secret_score}
            </div>
            <span className="text-sm" style={{ color: '#666666' }}>/10</span>
          </div>
          {report.the_secret_explanation && (
            <p className="text-sm leading-relaxed" style={{ color: '#333333' }}>
              {report.the_secret_explanation}
            </p>
          )}
        </div>
      )}

      {/* Actions — PDF download + new application */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-8">
        <PdfDownloadButton reportId={report.id} existingUrl={report.pdf_url} />
        <Link href="/apply" className="btn-secondary no-underline">
          Submit Another Application
        </Link>
      </div>
    </div>
  )
}

/* ===================================================================
 * PDF Download Button — generates on demand
 * =================================================================== */
function PdfDownloadButton({
  reportId,
  existingUrl,
}: {
  reportId: string
  existingUrl?: string | null
}) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'error'>('idle')
  const [pdfUrl, setPdfUrl] = useState(existingUrl || '')

  const handleDownload = async () => {
    // If we already have a URL, just open it
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
      return
    }

    setStatus('generating')

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId }),
      })

      if (!res.ok) {
        throw new Error('Failed to generate PDF')
      }

      const data = await res.json()
      setPdfUrl(data.pdf_url)
      setStatus('idle')
      window.open(data.pdf_url, '_blank')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'generating'}
      className="btn-primary inline-flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
    >
      {status === 'generating' ? (
        <>
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" opacity="1" />
          </svg>
          Generating PDF…
        </>
      ) : status === 'error' ? (
        'Failed — try again'
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF Report
        </>
      )}
    </button>
  )
}
