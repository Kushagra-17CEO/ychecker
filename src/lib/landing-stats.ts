import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_cache } from 'next/cache'

/**
 * Live stats for the landing page stats strip.
 * Cached for 60 seconds to avoid hitting Supabase on every page load.
 * Uses admin client (not server client) to avoid cookies() inside unstable_cache.
 */
export const getLandingStats = unstable_cache(
  async () => {
    try {
      const supabase = createAdminClient()

      // Stat 1: Total applications evaluated
      const { count: totalApps, error: appsError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })

      if (appsError) {
        console.error('Error fetching application count:', appsError)
      }

      // Stat 2 & 3: Sum weaknesses and fluff_flags array lengths from reports
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('weaknesses, fluff_flags')

      if (reportsError) {
        console.error('Error fetching report stats:', reportsError)
      }

      let totalWeaknesses = 0
      let totalFluffFlags = 0

      if (reports) {
        for (const r of reports) {
          if (Array.isArray(r.weaknesses)) totalWeaknesses += r.weaknesses.length
          if (Array.isArray(r.fluff_flags)) totalFluffFlags += r.fluff_flags.length
        }
      }

      return {
        applicationsEvaluated: totalApps ?? 0,
        criticalWeaknesses: totalWeaknesses,
        fluffFlagsDetected: totalFluffFlags,
      }
    } catch (err) {
      console.error('Error fetching landing stats:', err)
      return {
        applicationsEvaluated: 0,
        criticalWeaknesses: 0,
        fluffFlagsDetected: 0,
      }
    }
  },
  ['landing-stats'],
  { revalidate: 60 }
)
