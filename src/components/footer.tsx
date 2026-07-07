import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="w-full border-t py-8 mt-auto"
      style={{ borderColor: '#DDDDDD' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="no-underline">
            <span
              className="text-lg font-black"
              style={{ color: '#FF6B35' }}
            >
              YChecker
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm no-underline transition-colors"
              style={{ color: '#666666' }}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm no-underline transition-colors"
              style={{ color: '#666666' }}
            >
              Login
            </Link>
            <Link
              href="/terms"
              className="text-sm no-underline transition-colors"
              style={{ color: '#666666' }}
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm no-underline transition-colors"
              style={{ color: '#666666' }}
            >
              Privacy
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs" style={{ color: '#666666' }}>
            © {new Date().getFullYear()} YChecker
          </p>
        </div>
      </div>
    </footer>
  )
}
