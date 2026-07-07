'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      className="w-full border-b sticky top-0 z-40 bg-white"
      style={{ borderColor: '#DDDDDD' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Wordmark */}
          <Link href="/" className="no-underline flex-shrink-0">
            <span
              className="text-2xl font-black tracking-tight"
              style={{ color: '#FF6B35', minWidth: '120px' }}
            >
              YChecker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm font-medium no-underline transition-colors"
              style={{ color: '#111111' }}
            >
              Pricing
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium no-underline transition-colors"
                      style={{ color: '#111111' }}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/account"
                      className="text-sm font-medium no-underline transition-colors"
                      style={{ color: '#111111' }}
                    >
                      Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium bg-transparent border-none cursor-pointer transition-colors"
                      style={{ color: '#666666' }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-medium no-underline transition-colors"
                      style={{ color: '#111111' }}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/apply"
                      className="btn-primary text-sm no-underline"
                    >
                      Check My Application
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden bg-transparent border-none cursor-pointer p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-3 bg-white"
          style={{ borderColor: '#DDDDDD' }}
        >
          <Link
            href="/pricing"
            className="block text-sm font-medium no-underline py-2"
            style={{ color: '#111111' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block text-sm font-medium no-underline py-2"
                    style={{ color: '#111111' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account"
                    className="block text-sm font-medium no-underline py-2"
                    style={{ color: '#111111' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="block text-sm font-medium bg-transparent border-none cursor-pointer py-2 w-full text-left"
                    style={{ color: '#666666' }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-sm font-medium no-underline py-2"
                    style={{ color: '#111111' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/apply"
                    className="btn-primary block text-center text-sm no-underline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Check My Application
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  )
}
