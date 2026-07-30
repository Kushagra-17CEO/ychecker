/**
 * Shared error sanitization utilities for client-side components.
 * Ensures users NEVER see raw stack traces, internal paths, or DB errors.
 */

/**
 * Sanitize Supabase auth errors to safe, user-friendly messages.
 * Maps known Supabase error strings to friendly copies.
 * Unknown errors get a generic fallback.
 */
export function sanitizeAuthError(message: string): string {
  const safeMessages: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password.',
    'Email not confirmed': 'Please check your email and confirm your account first.',
    'User already registered': 'An account with this email already exists. Try signing in.',
    'Password should be at least 6 characters': 'Password must be at least 6 characters.',
    'Signup requires a valid password': 'Please enter a valid password.',
    'Unable to validate email address: invalid format': 'Please enter a valid email address.',
    'Email rate limit exceeded': 'Too many attempts. Please wait a few minutes and try again.',
    'For security purposes, you can only request this after': 'Please wait a moment before trying again.',
  }

  // Check exact matches first
  if (safeMessages[message]) return safeMessages[message]

  // Check partial matches (some Supabase errors have dynamic suffixes)
  for (const [key, value] of Object.entries(safeMessages)) {
    if (message.startsWith(key)) return value
  }

  return 'Something went wrong. Please try again.'
}

/**
 * Sanitize API error responses for display.
 * Our API routes return safe generic messages in `data.error`, but this
 * function guards against unexpected errors (network failures, JSON parse
 * errors, etc.) that could leak internals.
 *
 * Allowlisted messages pass through; everything else gets the fallback.
 */
export function sanitizeApiError(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (!(err instanceof Error)) return fallback

  const msg = err.message

  // Our API error messages are safe — they match these patterns
  const safePatterns = [
    /^you must be signed in/i,
    /^not authenticated/i,
    /^invalid/i,
    /^missing/i,
    /^failed to/i,
    /^rate limit/i,
    /^report not found/i,
    /^this report is already/i,
    /^payment/i,
    /^ai /i,
    /^something went wrong/i,
    /^too many requests/i,
    /^submission failed/i,
    /^account/i,
    /^application/i,
    /please try again/i,
    /please contact support/i,
    /^login failed/i,
    /^password/i,
    /^admin/i,
    /^unauthorized/i,
    // Razorpay / network
    /^payment system is loading/i,
    /^payment was received but/i,
  ]

  if (safePatterns.some((pattern) => pattern.test(msg))) {
    return msg
  }

  return fallback
}
