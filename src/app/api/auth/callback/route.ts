import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/email'
import WelcomeEmail from '@/../emails/welcome'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  try {
    const code = searchParams.get('code')
    // If "next" is in params, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    // Rate limit — auth tier (strict + exponential backoff)
    const clientIp = await getClientIp()
    const rl = await checkRateLimit(clientIp, 'auth', '/api/auth/callback')
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter)

    if (code) {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // The `setAll` method was called from a Server Component.
              }
            },
          },
        }
      )

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Send welcome email on first login (non-blocking)
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email && !user.user_metadata?.welcome_email_sent) {
          sendEmail({
            to: user.email,
            subject: 'Welcome to YChecker',
            react: WelcomeEmail(),
          })
            .then(() =>
              supabase.auth.updateUser({ data: { welcome_email_sent: true } })
            )
            .catch((e) => console.error('Welcome email failed:', e))
        }

        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        if (isLocalEnv) {
          // In development, no load balancer; use origin directly
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  } catch (err) {
    console.error('Auth callback error:', err)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  }
}

