'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Next.js Error Boundary — catches runtime errors in route segments.
 * Shows a generic, user-friendly error page. Never exposes stack traces,
 * internal paths, or error details to the client.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error server-side only — never expose to user
    console.error('Application error:', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#F9F9F9' }}
    >
      <div className="max-w-md w-full text-center px-6">
        <h1
          className="text-6xl font-black mb-4"
          style={{ color: '#FF6B35' }}
        >
          Oops
        </h1>
        <h2
          className="text-xl font-bold mb-3"
          style={{ color: '#111111' }}
        >
          Something went wrong
        </h2>
        <p
          className="text-sm mb-8 leading-relaxed"
          style={{ color: '#666666' }}
        >
          We ran into an unexpected error. This has been logged and
          we&apos;ll look into it. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary text-sm cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="text-sm font-medium no-underline"
            style={{ color: '#FF6B35' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
