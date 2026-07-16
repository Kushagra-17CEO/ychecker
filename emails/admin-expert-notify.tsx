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

interface AdminExpertNotifyEmailProps {
  userEmail: string
  oneLiner: string
}

/**
 * Admin Expert Review Notification — sent to ADMIN_EMAIL when Expert Review is purchased
 * Blueprint Section 9.1: User email, one-liner, link to /admin.
 */
export default function AdminExpertNotifyEmail({
  userEmail,
  oneLiner,
}: AdminExpertNotifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New Expert Review Order — Action Required</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={logoStyle}>YChecker Admin</Heading>

          <Heading as="h1" style={h1Style}>
            New Expert Review Order
          </Heading>

          <Text style={textStyle}>
            A user just purchased an Expert Review. Review their application and
            deliver the report within 24–48 hours.
          </Text>

          <Text style={detailLabelStyle}>Customer Email:</Text>
          <Text style={detailValueStyle}>{userEmail}</Text>

          <Text style={detailLabelStyle}>One-Liner:</Text>
          <Text style={detailValueStyle}>&ldquo;{oneLiner}&rdquo;</Text>

          <Link href={`${BASE_URL}/admin`} style={buttonStyle}>
            Open Admin Panel →
          </Link>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            This is an automated notification from YChecker.
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

const detailLabelStyle: React.CSSProperties = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px 0',
}

const detailValueStyle: React.CSSProperties = {
  color: '#111111',
  fontSize: '15px',
  fontWeight: 500,
  margin: '0 0 16px 0',
  padding: '12px 16px',
  backgroundColor: '#F5F5F5',
  borderRadius: '8px',
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
  marginTop: '16px',
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
