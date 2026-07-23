'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Login failed.')
      }

      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#F9F9F9' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-xl shadow-sm"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EEEEEE' }}
      >
        <h1
          className="text-2xl font-black text-center mb-1"
          style={{ color: '#FF6B35' }}
        >
          YChecker
        </h1>
        <p
          className="text-xs text-center mb-8"
          style={{ color: '#AAAAAA' }}
        >
          Admin Panel
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="admin-password"
            className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: '#666666' }}
          >
            Admin Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 rounded-lg text-sm mb-4"
            style={{
              border: '1px solid #DDDDDD',
              color: '#111111',
              outline: 'none',
            }}
            placeholder="Enter admin password"
          />

          {error && (
            <p className="text-sm mb-4" style={{ color: '#C0392B' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-sm disabled:opacity-60"
          >
            {loading ? 'Verifying…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
