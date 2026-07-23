import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

// ============================================================
// Configurable Rate Limit Constants
// ============================================================

/** Rate limit tiers with configurable thresholds */
export const RATE_LIMIT_CONFIG = {
  /**
   * AUTH tier — strictest limits with exponential backoff.
   * Used for: /api/admin/login, /api/auth/callback
   */
  auth: {
    windowSeconds: 60,            // 1 minute base window
    maxRequests: 5,               // 5 attempts per window
    maxBackoffLevel: 4,           // max escalation level
    backoffBaseSeconds: 60,       // base backoff = 60s, doubles each level
    backoffCapSeconds: 900,       // cap at 15 minutes
  },

  /**
   * PUBLIC tier — moderate limits for unauthenticated endpoints.
   * Used for: /api/auth/welcome, /api/razorpay/webhook
   */
  public: {
    windowSeconds: 60,            // 1 minute window
    maxRequests: 20,              // 20 requests per window
  },

  /**
   * AUTHENTICATED tier — loose limits for logged-in users.
   * Used for: /api/evaluate, /api/generate-pdf, /api/razorpay/*,
   *           /api/report/[id], /api/account/delete, /api/admin/*
   */
  authenticated: {
    windowSeconds: 60,            // 1 minute window
    maxRequests: 30,              // 30 requests per window
  },
} as const

export type RateLimitTier = keyof typeof RATE_LIMIT_CONFIG

// ============================================================
// Rate Limit Result
// ============================================================

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Seconds until the client can retry (for 429 Retry-After header) */
  retryAfter: number
  /** Remaining requests in the current window */
  remaining: number
}

// ============================================================
// Core Rate Limit Check
// ============================================================

/**
 * Check rate limit for a given identifier, tier, and endpoint.
 *
 * @param identifier - IP address (for auth/public) or user_id (for authenticated)
 * @param tier - 'auth' | 'public' | 'authenticated'
 * @param endpoint - Route path (e.g. '/api/evaluate')
 * @returns RateLimitResult with allowed, retryAfter, and remaining
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier,
  endpoint: string
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIG[tier]

  try {
    const adminSupabase = createAdminClient()

    // Calculate effective window (for auth tier, factor in backoff)
    let effectiveWindowSeconds = config.windowSeconds

    if (tier === 'auth') {
      // Check current backoff level first
      const { data: existing } = await adminSupabase
        .from('rate_limits')
        .select('backoff_level, window_start')
        .eq('identifier', identifier)
        .eq('endpoint', endpoint)
        .single()

      if (existing && existing.backoff_level > 0) {
        const authConfig = RATE_LIMIT_CONFIG.auth
        const backoffSeconds = Math.min(
          authConfig.backoffBaseSeconds * Math.pow(2, existing.backoff_level - 1),
          authConfig.backoffCapSeconds
        )
        const windowEnd = new Date(existing.window_start).getTime() + backoffSeconds * 1000

        if (Date.now() < windowEnd) {
          // Still in backoff period
          const retryAfter = Math.ceil((windowEnd - Date.now()) / 1000)
          return {
            allowed: false,
            retryAfter,
            remaining: 0,
          }
        }

        // Backoff period expired — use normal window
        effectiveWindowSeconds = config.windowSeconds
      }
    }

    // Call the atomic check function
    const { data, error } = await adminSupabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_window_seconds: effectiveWindowSeconds,
      p_max_requests: config.maxRequests,
    })

    if (error) {
      console.error('Rate limit check error:', error)
      // Fail open — allow the request if rate limiting fails
      return { allowed: true, retryAfter: 0, remaining: config.maxRequests }
    }

    const result = data?.[0]
    if (!result) {
      return { allowed: true, retryAfter: 0, remaining: config.maxRequests }
    }

    const currentCount = result.current_count
    const remaining = Math.max(0, config.maxRequests - currentCount)

    if (currentCount > config.maxRequests) {
      // Rate limit exceeded
      if (tier === 'auth') {
        // Escalate backoff for auth tier
        const { data: newLevel } = await adminSupabase.rpc('escalate_backoff', {
          p_identifier: identifier,
          p_endpoint: endpoint,
          p_max_backoff: RATE_LIMIT_CONFIG.auth.maxBackoffLevel,
        })

        const level = newLevel || 1
        const backoffSeconds = Math.min(
          RATE_LIMIT_CONFIG.auth.backoffBaseSeconds * Math.pow(2, level - 1),
          RATE_LIMIT_CONFIG.auth.backoffCapSeconds
        )

        return {
          allowed: false,
          retryAfter: backoffSeconds,
          remaining: 0,
        }
      }

      // For non-auth tiers: flat retry after remaining window time
      const windowStart = new Date(result.current_window_start).getTime()
      const windowEnd = windowStart + effectiveWindowSeconds * 1000
      const retryAfter = Math.max(1, Math.ceil((windowEnd - Date.now()) / 1000))

      return {
        allowed: false,
        retryAfter,
        remaining: 0,
      }
    }

    return {
      allowed: true,
      retryAfter: 0,
      remaining,
    }
  } catch (err) {
    console.error('Rate limit system error:', err)
    // Fail open
    return { allowed: true, retryAfter: 0, remaining: RATE_LIMIT_CONFIG[tier].maxRequests }
  }
}

// ============================================================
// Helper: Get Client IP
// ============================================================

/**
 * Extract client IP from request headers.
 * Works on Vercel (x-forwarded-for) and locally.
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = headersList.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return '127.0.0.1'
}

// ============================================================
// Helper: Build 429 Response
// ============================================================

/**
 * Build a standard 429 Too Many Requests response.
 */
export function rateLimitResponse(retryAfter: number): Response {
  return Response.json(
    {
      error: 'Too many requests. Please try again later.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(retryAfter),
      },
    }
  )
}
