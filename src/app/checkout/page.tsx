import type { Metadata } from 'next'
import { Suspense } from 'react'
import CheckoutClient from './checkout-client'

export const metadata: Metadata = {
  title: 'Checkout — YChecker',
  description: 'Complete your payment to unlock your YC application report.',
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-sm" style={{ color: '#666666' }}>Loading checkout...</p>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  )
}
