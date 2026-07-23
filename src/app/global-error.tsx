'use client'

import { useEffect } from 'react'

/**
 * Next.js Global Error Boundary — catches errors in the root layout itself.
 * This is the last-resort fallback. Must include its own <html> and <body> tags.
 * Never exposes stack traces, internal paths, or error details to the client.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global application error:', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          backgroundColor: '#F9F9F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div style={{ maxWidth: '420px', textAlign: 'center', padding: '24px' }}>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 900,
              color: '#FF6B35',
              margin: '0 0 16px 0',
            }}
          >
            Oops
          </h1>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#111111',
              margin: '0 0 12px 0',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#666666',
              lineHeight: '22px',
              margin: '0 0 32px 0',
            }}
          >
            We ran into an unexpected error. Please try again or return
            to the home page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#FF6B35',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginRight: '12px',
            }}
          >
            Try Again
          </button>
          <a
            href="/"
            style={{
              color: '#FF6B35',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Go Home
          </a>
        </div>
      </body>
    </html>
  )
}
