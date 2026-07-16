'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Delete Account Button — Blueprint 9.3
 * Requires double confirmation before deleting.
 */
export default function DeleteAccountButton() {
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setStep('deleting')
    setError('')

    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete account.')
      }

      // Redirect to home after deletion
      router.push('/?deleted=true')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStep('idle')
    }
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm')}
        className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        style={{
          color: '#C0392B',
          backgroundColor: '#FFEBEE',
          border: '1px solid #FFCDD2',
        }}
      >
        Delete My Account & All Data
      </button>
    )
  }

  if (step === 'confirm') {
    return (
      <div>
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: '#C0392B' }}
        >
          Are you sure? This will permanently delete your account, all
          applications, reports, and payment records. This cannot be undone.
        </p>
        {error && (
          <p className="text-sm mb-3" style={{ color: '#C0392B' }}>
            {error}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="text-sm font-bold px-4 py-2 rounded-lg text-white cursor-pointer"
            style={{ backgroundColor: '#C0392B' }}
          >
            Yes, Delete Everything
          </button>
          <button
            onClick={() => setStep('idle')}
            className="text-sm px-4 py-2 rounded-lg cursor-pointer"
            style={{
              color: '#666666',
              backgroundColor: '#F5F5F5',
              border: '1px solid #DDDDDD',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Deleting state
  return (
    <p className="text-sm font-medium" style={{ color: '#C0392B' }}>
      Deleting your account…
    </p>
  )
}
