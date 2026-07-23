import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import * as React from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ychecker.vercel.app'

interface ExpertDeliveredEmailProps {
  reportId: string
}

/**
 * Expert Review Delivered — sent to USER when admin marks review as delivered.
 * Blueprint Section 9.1
 */
export default function ExpertDeliveredEmail({
  reportId,
}: ExpertDeliveredEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Expert Review Report is ready — view it now</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={logoStyle}>YChecker</Heading>

          <Heading as="h1" style={h1Style}>
            Your Expert Review Is Ready
          </Heading>

          <Text style={textStyle}>
            Great news — a human expert has finished reviewing your YC
            application. Your full Expert Review report is now available.
          </Text>

          <Text style={highlightStyle}>
            Your report includes everything in the AI Report plus expert
            commentary, deeper rewrite suggestions, and human-checked feedback
            on every answer.
          </Text>

          <Link href={`${BASE_URL}/report/${reportId}`} style={buttonStyle}>
            View Your Expert Review →
          </Link>

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

const highlightStyle: React.CSSProperties = {
  color: '#111111',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
  padding: '16px',
  backgroundColor: '#E8F5E9',
  borderRadius: '8px',
  borderLeft: '4px solid #1A7F4B',
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
  marginTop: '8px',
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
