import Link from 'next/link'

/**
 * Footer — Landing Page Blueprint Section 9
 * Two-column on desktop, stacked on mobile. Clean and minimal.
 */
export default function Footer() {
  return (
    <footer
      className="w-full"
      style={{ borderTop: '1px solid #DDDDDD' }}
    >
      {/* Hover style for footer links — CSS only, no JS handlers */}
      <style>{`
        .footer-link:hover {
          text-decoration: underline;
          text-decoration-color: #FF6B35;
        }
      `}</style>

      {/* Main footer content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: '48px 16px' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: Wordmark + tagline */}
          <div>
            <Link href="/" className="no-underline">
              <span
                style={{ fontSize: 20, fontWeight: 900, color: '#FF6B35' }}
              >
                YChecker
              </span>
            </Link>
            <p
              style={{
                fontSize: 14,
                color: '#666666',
                marginTop: 4,
              }}
            >
              The brutal truth your application needs.
            </p>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-4" style={{ fontSize: 14 }}>
            {[
              { label: 'Pricing', href: '/pricing' },
              { label: 'Login', href: '/login' },
              { label: 'Terms', href: '/terms' },
              { label: 'Privacy', href: '/privacy' },
            ].map((link, i) => (
              <span key={link.label} className="flex items-center gap-4">
                {i > 0 && (
                  <span style={{ color: '#DDDDDD' }}>·</span>
                )}
                <Link
                  href={link.href}
                  className="footer-link no-underline"
                  style={{ color: '#666666' }}
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom copyright line */}
      <div
        style={{
          borderTop: '1px solid #DDDDDD',
          padding: '24px 16px',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ fontSize: 13, color: '#666666', margin: 0 }}>
            © {new Date().getFullYear()} YChecker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
