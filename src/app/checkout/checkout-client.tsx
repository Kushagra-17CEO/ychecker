'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import { PRICING } from '@/lib/types'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
    }
  }
}

/**
 * Checkout Client — Blueprint Section 8.2 Step 4
 * Opens the Razorpay payment modal, then verifies payment server-side.
 */
export default function CheckoutClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get('report')
  const tier = (searchParams.get('tier') || 'ai') as 'ai' | 'expert'
  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const pricing = PRICING[tier] || PRICING.ai

  useEffect(() => {
    if (!reportId) {
      setStatus('error')
      setErrorMsg('No report specified. Please go back and try again.')
      return
    }

    // Wait for Razorpay script to load
    const checkRazorpay = setInterval(() => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        clearInterval(checkRazorpay)
        setStatus('ready')
      }
    }, 200)

    const timeout = setTimeout(() => {
      clearInterval(checkRazorpay)
      if (status === 'loading') {
        setStatus('ready') // Proceed anyway, will fail gracefully if Razorpay isn't loaded
      }
    }, 5000)

    return () => {
      clearInterval(checkRazorpay)
      clearTimeout(timeout)
    }
  }, [reportId, status])

  const handlePayment = async () => {
    if (!reportId) return
    setStatus('processing')

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, tier }),
      })

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create order')
      }

      const order = await orderRes.json()

      // 2. Open Razorpay checkout modal
      if (!window.Razorpay) {
        throw new Error('Payment system is loading. Please try again.')
      }

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'YChecker',
        description: `${pricing.label} — Unlock your YC application report`,
        theme: {
          color: '#FF6B35',
        },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          // 3. Verify payment server-side
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                report_id: reportId,
                tier,
              }),
            })

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed')
            }

            const result = await verifyRes.json()

            // 4. Redirect on success
            if (result.redirect) {
              router.push(result.redirect)
            } else {
              router.push(`/report/${reportId}?payment=success`)
            }
          } catch {
            setStatus('error')
            setErrorMsg('Payment was received but verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            setStatus('ready')
          },
        },
      })

      rzp.open()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: '#111111' }}
          >
            {tier === 'expert' ? 'Expert Review' : 'AI Report'}
          </h1>
          <p
            className="text-4xl font-black mb-6"
            style={{ color: '#FF6B35' }}
          >
            ${pricing.priceUSD}
          </p>

          {status === 'error' ? (
            <div className="mb-6">
              <p className="text-sm mb-4" style={{ color: '#C0392B' }}>
                {errorMsg}
              </p>
              <button
                onClick={() => { setStatus('ready'); setErrorMsg('') }}
                className="btn-secondary"
              >
                Try Again
              </button>
            </div>
          ) : (
            <button
              onClick={handlePayment}
              disabled={status === 'processing' || status === 'loading'}
              className="btn-primary text-lg px-8 py-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'processing'
                ? 'Processing...'
                : status === 'loading'
                  ? 'Loading...'
                  : `Pay $${pricing.priceUSD} — Unlock Report`}
            </button>
          )}

          <p className="text-xs mt-6" style={{ color: '#666666' }}>
            Payments processed securely by Razorpay. Supports UPI, cards, net banking, and wallets.
          </p>
        </div>
      </main>
    </>
  )
}
