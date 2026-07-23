import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-6 py-16">
          <h1
            className="text-6xl font-black mb-4"
            style={{ color: '#FF6B35' }}
          >
            404
          </h1>
          <h2
            className="text-xl font-bold mb-3"
            style={{ color: '#111111' }}
          >
            Page Not Found
          </h2>
          <p
            className="text-sm mb-8 max-w-md mx-auto leading-relaxed"
            style={{ color: '#666666' }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>
          <Link href="/" className="btn-primary text-sm no-underline">
            Go Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
