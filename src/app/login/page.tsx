import { Suspense } from 'react'
import type { Metadata } from 'next'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Sign In — YChecker',
  description: 'Sign in to your YChecker account to view your YC application reports.',
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1
          className="text-4xl font-black tracking-tight mb-4"
          style={{ color: '#FF6B35' }}
        >
          YChecker
        </h1>
        <p className="text-sm" style={{ color: '#666666' }}>Loading...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
