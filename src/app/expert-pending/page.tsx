import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Expert Review Ordered — YChecker',
  description: 'Your Expert Review order has been received. Expect your report within 24–48 hours.',
}

export default function ExpertPendingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-6">✅</div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{ color: '#111111' }}
          >
            Expert Review Ordered
          </h1>
          <p
            className="text-base mb-2 leading-relaxed"
            style={{ color: '#666666' }}
          >
            We&apos;ve received your order. A human expert will review your YC application
            answers using detailed evaluation criteria.
          </p>
          <p
            className="text-base mb-8 leading-relaxed font-semibold"
            style={{ color: '#FF6B35' }}
          >
            Expect your full report within 24–48 hours.
          </p>
          <p
            className="text-sm mb-8"
            style={{ color: '#666666' }}
          >
            You&apos;ll receive an email when your report is ready. You can also check
            your dashboard for status updates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary no-underline">
              Go to Dashboard
            </Link>
            <Link href="/" className="btn-secondary no-underline">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
