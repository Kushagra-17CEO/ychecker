import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ychecker.vercel.app'

interface ReportReadyEmailProps {
  reportId: string
}

/**
 * Report Ready Email — sent after AI report payment confirmed
 * Blueprint Section 9.1: Direct link to /report/[id]. Full report now unlocked.
 */
export default function ReportReadyEmail({ reportId }: ReportReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your AI Report is ready — see your YC application score</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={logoStyle}>YChecker</Heading>

          <Heading as="h1" style={h1Style}>
            Your AI Report Is Ready
          </Heading>

          <Text style={textStyle}>
            Your YC application has been evaluated. Your full report is now
            unlocked — including your overall score, section-by-section breakdown,
            fluff detection, blind spots, and rewrite suggestions.
          </Text>

          <Section style={buttonContainerStyle}>
            <Link href={`${BASE_URL}/report/${reportId}`} style={buttonStyle}>
              View My Full Report →
            </Link>
          </Section>

          <Text style={tipStyle}>
            💡 Tip: Use the rewrite suggestions to strengthen weak sections before
            your deadline.
          </Text>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            © {new Date().getFullYear()} YChecker
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const containerStyle: React.CSSProperties = {
  margin: '0 auto',
  padding: '40px 24px',
  maxWidth: '560px',
}

const logoStyle: React.CSSProperties = {
  color: '#FF6B35',
  fontSize: '28px',
  fontWeight: 900,
  letterSpacing: '-0.5px',
  margin: '0 0 32px 0',
}

const h1Style: React.CSSProperties = {
  color: '#111111',
  fontSize: '24px',
  fontWeight: 700,
  margin: '0 0 16px 0',
}

const textStyle: React.CSSProperties = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
}

const tipStyle: React.CSSProperties = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px 0',
  padding: '12px 16px',
  backgroundColor: '#FFF8E1',
  borderRadius: '8px',
}

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#FF6B35',
  color: '#FFFFFF',
  padding: '14px 28px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
}

const hrStyle: React.CSSProperties = {
  borderColor: '#DDDDDD',
  margin: '32px 0',
}

const footerStyle: React.CSSProperties = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '20px',
}
