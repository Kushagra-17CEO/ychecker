import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_COOKIE_NAME = 'ychecker_admin_session'
const ADMIN_COOKIE_VALUE = 'authenticated'
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24 hours

/**
 * POST /api/admin/login
 *
 * Blueprint 13.1: Check password against ADMIN_PASSWORD env var.
 * On success, set secure admin session cookie.
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required.' },
        { status: 400 }
      )
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD env var not set')
      return NextResponse.json(
        { error: 'Admin access is not configured.' },
        { status: 500 }
      )
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password.' },
        { status: 401 }
      )
    }

    // Set admin session cookie
    const cookieStore = await cookies()
    cookieStore.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Login failed.' },
      { status: 500 }
    )
  }
}
