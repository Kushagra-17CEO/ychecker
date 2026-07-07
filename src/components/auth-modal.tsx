'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  redirectTo?: string
}

/**
 * Auth gate modal — appears when unauthenticated user tries to submit
 * the application form. Framed around completing something already started
 * (Sunk Cost Effect per Section 4.3).
 */
export default function AuthModal({ isOpen, onClose, onSuccess, redirectTo = '/' }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true) // Default to sign-up since they're new
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  if (!isOpen) return null

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        // Auto sign-in after sign-up for smoother flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) {
          setMessage('Account created! Check your email to confirm, then sign in.')
        } else {
          onSuccess()
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        onSuccess()
      }
    }

    setLoading(false)
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-8 z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl bg-transparent border-none cursor-pointer"
          style={{ color: '#666666' }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Header — framed as completing, not starting (Sunk Cost Effect) */}
        <div className="text-center mb-6">
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: '#111111' }}
          >
            {isSignUp
              ? 'Create a free account to see your results'
              : 'Sign in to see your results'}
          </h2>
          <p className="text-sm" style={{ color: '#666666' }}>
            Your answers are saved — we just need your email to show you the report.
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: '#FFF0E8',
              color: '#C0392B',
              border: '1px solid #C0392B',
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: '#E8F5E8',
              color: '#1A7F4B',
              border: '1px solid #1A7F4B',
            }}
          >
            {message}
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg text-base font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#111111',
            border: '1px solid #DDDDDD',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px" style={{ backgroundColor: '#DDDDDD' }} />
          <span className="text-xs font-medium uppercase" style={{ color: '#666666' }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#DDDDDD' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="input"
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignUp ? 'Create a password' : 'Password'}
            required
            minLength={6}
            className="input"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Free Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-4 text-center text-sm" style={{ color: '#666666' }}>
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setIsSignUp(false); setError(null); setMessage(null) }}
                className="font-semibold underline bg-transparent border-none cursor-pointer"
                style={{ color: '#FF6B35' }}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              No account?{' '}
              <button
                onClick={() => { setIsSignUp(true); setError(null); setMessage(null) }}
                className="font-semibold underline bg-transparent border-none cursor-pointer"
                style={{ color: '#FF6B35' }}
              >
                Create one free
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
