import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client using the service role key.
 * This bypasses RLS and should ONLY be used in server-side API routes.
 * NEVER import this in client-side code or components.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
