import { createClient } from '@/lib/supabase/server'

/**
 * Fetches the count of applications submitted this week.
 * Used for the live social proof counter on the landing page.
 * Returns a real count from the database — never fabricated (Blueprint Section 4.3).
 */
export async function getWeeklyApplicationCount(): Promise<number> {
  try {
    const supabase = await createClient()

    // Get the start of the current week (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Adjust for Monday start
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - diff)
    weekStart.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString())

    if (error) {
      console.error('Error fetching weekly application count:', error)
      return 0
    }

    return count ?? 0
  } catch {
    // If the table doesn't exist yet or any other error, return 0 gracefully
    return 0
  }
}
