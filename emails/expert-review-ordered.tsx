import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import * as React from 'react'

/**
 * Expert Review Ordered — sent to USER after Expert Review payment
 * Blueprint Section 9.1: Confirmation + 24–48 hour turnaround expectation.
 */
export default function ExpertReviewOrderedEmail() {
  return (
    <Html>
      <Head />
      <Preview>Your Expert Review order is confirmed — expect your report within 24–48 hours</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={logoStyle}>YChecker</Heading>

          <Heading as="h1" style={h1Style}>
            We&apos;ve Received Your Expert Review Order
          </Heading>

          <Text style={textStyle}>
            Thank you for your order. A human expert will now review your YC
            application answers using detailed evaluation criteria.
          </Text>

          <Text style={highlightStyle}>
            📋 Your full Expert Review report will be delivered to this email
            within <strong>24–48 hours</strong>.
          </Text>

          <Text style={textStyle}>
            Your report will include everything in the AI Report plus expert
            commentary on each answer and deeper, human-checked rewrite
            suggestions.
          </Text>

          <Text style={textStyle}>
            You&apos;ll receive another email when your report is ready.
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

const highlightStyle: React.CSSProperties = {
  color: '#111111',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
  padding: '16px',
  backgroundColor: '#FFF0E8',
  borderRadius: '8px',
  borderLeft: '4px solid #FF6B35',
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
