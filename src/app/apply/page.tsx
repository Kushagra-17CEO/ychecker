import type { Metadata } from 'next'
import Navbar from '@/components/navbar'
import ApplicationForm from './application-form'

export const metadata: Metadata = {
  title: 'Evaluate My Application — YChecker',
  description:
    'Submit your YC application answers for AI evaluation. Get scored on clarity, traction, team risk, market size, and unique insight.',
}

export default function ApplyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <ApplicationForm />
      </main>
    </>
  )
}
