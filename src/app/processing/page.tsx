import type { Metadata } from 'next'
import { Suspense } from 'react'
import ProcessingScreen from './processing-screen'

export const metadata: Metadata = {
  title: 'Evaluating Your Application — YChecker',
  description: 'Your YC application is being evaluated by our AI.',
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1
              className="text-4xl font-black tracking-tight mb-4"
              style={{ color: '#FF6B35' }}
            >
              YChecker
            </h1>
            <p className="text-sm" style={{ color: '#666666' }}>
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <ProcessingScreen />
    </Suspense>
  )
}
