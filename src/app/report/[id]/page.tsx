import type { Metadata } from 'next'
import { Suspense } from 'react'
import ReportView from './report-view'

export const metadata: Metadata = {
  title: 'Your Report — YChecker',
  description: 'View your YC application evaluation report.',
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

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
              Loading your report...
            </p>
          </div>
        </div>
      }
    >
      <ReportView reportId={id} />
    </Suspense>
  )
}
