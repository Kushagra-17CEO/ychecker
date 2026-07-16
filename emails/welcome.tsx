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

/**
 * Welcome Email — sent on new user sign-up
 * Blueprint Section 9.1: Brief intro. Link to /apply.
 */
export default function WelcomeEmail() {
  return (
    <Html>
      <Head />
      <Preview>Welcome to YChecker — let&apos;s check your YC application</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={logoStyle}>YChecker</Heading>

          <Heading as="h1" style={h1Style}>
            Welcome to YChecker
          </Heading>

          <Text style={textStyle}>
            You&apos;re in. Now let&apos;s find out if your YC application would get you
            rejected — before you actually submit it.
          </Text>

          <Text style={textStyle}>
            YChecker evaluates your application answers with the same brutal
            honesty a YC partner would use. No encouragement. No fluff. Just the
            truth.
          </Text>

          <Section style={buttonContainerStyle}>
            <Link href={`${BASE_URL}/apply`} style={buttonStyle}>
              Check My Application →
            </Link>
          </Section>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            © {new Date().getFullYear()} YChecker. You received this because you
            signed up at ychecker.vercel.app.
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
