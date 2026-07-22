import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { SectionEvaluation } from '@/lib/types'

// Register Inter font for the PDF
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2',
      fontWeight: 700,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYAZ9hiA.woff2',
      fontWeight: 900,
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },
  // Header
  header: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: 900,
    color: '#FF6B35',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: '#666666',
  },
  // Score Badge
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  scoreBadge: {
    fontSize: 28,
    fontWeight: 900,
  },
  scoreLabel: {
    fontSize: 9,
    color: '#666666',
  },
  // Verdict
  verdict: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
  },
  // Section
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 16,
    color: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 4,
  },
  sectionScore: {
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 9,
    fontWeight: 600,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  bulletItem: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 3,
    paddingLeft: 8,
  },
  rewrite: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333333',
    fontStyle: 'italic',
    padding: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 4,
    marginTop: 4,
  },
  // Blind Spots
  blindSpotItem: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 4,
    paddingLeft: 8,
  },
  // Secret Score
  secretSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  secretTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
  },
  secretScore: {
    fontSize: 18,
    fontWeight: 900,
    color: '#FF6B35',
    marginBottom: 4,
  },
  secretExplanation: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333333',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#AAAAAA',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
  // Fluff
  fluffItem: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 3,
    paddingLeft: 8,
    color: '#C0392B',
  },
})

const SECTION_LABELS: Record<string, string> = {
  one_liner: 'One-Liner',
  problem: 'Problem & Solution',
  traction: 'Traction & Metrics',
  team: 'Team & Founder-Market Fit',
  competitors: 'Competitor Landscape',
}

function getScoreColorHex(score: number): string {
  if (score < 50) return '#C0392B'
  if (score < 75) return '#D68910'
  return '#1A7F4B'
}

interface ReportPDFProps {
  overall_score: number
  verdict: string
  sections: Record<string, SectionEvaluation>
  blind_spots: string[]
  the_secret_score: number
  the_secret_explanation: string
  created_at: string
}

export default function ReportPDF({
  overall_score,
  verdict,
  sections,
  blind_spots,
  the_secret_score,
  the_secret_explanation,
  created_at,
}: ReportPDFProps) {
  const scoreColor = getScoreColorHex(overall_score)
  const date = new Date(created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>YChecker</Text>
          <Text style={styles.subtitle}>
            YC Application Evaluation Report · Generated {date}
          </Text>
        </View>

        {/* Overall Score */}
        <View style={styles.scoreContainer}>
          <Text style={{ ...styles.scoreBadge, color: scoreColor }}>
            {overall_score}/100
          </Text>
          <Text style={styles.scoreLabel}>Overall Score</Text>
        </View>

        {/* Verdict */}
        <View style={styles.verdict}>
          <Text>{verdict}</Text>
        </View>

        {/* Section Breakdowns */}
        {Object.entries(sections).map(([key, section]) => (
          <View key={key} wrap={false}>
            <Text style={styles.sectionTitle}>
              {SECTION_LABELS[key] || key} — {section.score}/10
            </Text>

            {section.strengths.length > 0 && (
              <>
                <Text style={styles.subHeading}>Strengths</Text>
                {section.strengths.map((s, i) => (
                  <Text key={i} style={styles.bulletItem}>
                    ✓ {s}
                  </Text>
                ))}
              </>
            )}

            {section.weaknesses.length > 0 && (
              <>
                <Text style={styles.subHeading}>Weaknesses</Text>
                {section.weaknesses.map((w, i) => (
                  <Text key={i} style={styles.bulletItem}>
                    ✗ {w}
                  </Text>
                ))}
              </>
            )}

            {section.fluff_flags.length > 0 && (
              <>
                <Text style={styles.subHeading}>Fluff Detected</Text>
                {section.fluff_flags.map((f, i) => (
                  <Text key={i} style={styles.fluffItem}>
                    ⚠ &ldquo;{f}&rdquo;
                  </Text>
                ))}
              </>
            )}

            {section.rewrite_suggestion && (
              <>
                <Text style={styles.subHeading}>Rewrite Suggestion</Text>
                <Text style={styles.rewrite}>
                  {section.rewrite_suggestion}
                </Text>
              </>
            )}
          </View>
        ))}

        {/* Blind Spots */}
        {blind_spots.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Blind Spots</Text>
            {blind_spots.map((b, i) => (
              <Text key={i} style={styles.blindSpotItem}>
                ⚠ {b}
              </Text>
            ))}
          </View>
        )}

        {/* The Secret Score */}
        <View style={styles.secretSection} wrap={false}>
          <Text style={styles.secretTitle}>The Secret Score</Text>
          <Text style={styles.secretScore}>{the_secret_score}/10</Text>
          <Text style={styles.secretExplanation}>
            {the_secret_explanation}
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Generated by YChecker · ychecker.vercel.app · Confidential
        </Text>
      </Page>
    </Document>
  )
}
