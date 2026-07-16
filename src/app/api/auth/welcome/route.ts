import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import WelcomeEmail from '@/../emails/welcome'

/**
 * POST /api/auth/welcome
 *
 * Sends the welcome email after a new user signs up.
 * Called by the frontend after successful sign-up (not sign-in).
 * Idempotent — checks if email was already sent via user metadata.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    // Check if welcome email was already sent (idempotent)
    const metadata = user.user_metadata || {}
    if (metadata.welcome_email_sent) {
      return NextResponse.json({ status: 'already_sent' })
    }

    // Send welcome email (non-blocking for the response)
    await sendEmail({
      to: user.email!,
      subject: 'Welcome to YChecker',
      react: WelcomeEmail(),
    })

    // Mark as sent in user metadata
    await supabase.auth.updateUser({
      data: { welcome_email_sent: true },
    })

    return NextResponse.json({ status: 'sent' })
  } catch (err) {
    console.error('Welcome email error:', err)
    // Don't fail the signup flow if email fails
    return NextResponse.json({ status: 'error' })
  }
}
