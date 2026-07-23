import { cookies } from 'next/headers'

const ADMIN_COOKIE_NAME = 'ychecker_admin_session'
const ADMIN_COOKIE_VALUE = 'authenticated'

/**
 * Verify admin session cookie. Returns true if valid.
 */
export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)
  return adminCookie?.value === ADMIN_COOKIE_VALUE
}
