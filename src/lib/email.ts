import { Resend } from 'resend'

/**
 * Resend email client
 * See Blueprint Section 9 for email specifications
 */

const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender — update once domain is verified in Resend dashboard
const FROM_EMAIL = 'YChecker <noreply@ychecker.com>'

interface SendEmailOptions {
  to: string
  subject: string
  react: React.ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react,
    })

    if (error) {
      console.error('Email send error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (err) {
    console.error('Email send exception:', err)
    throw err
  }
}

export { resend }
