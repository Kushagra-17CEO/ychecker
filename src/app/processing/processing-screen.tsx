'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Processing Screen — Blueprint Section 4.3
 * Full-screen loading experience while Gemini API runs (10–20 seconds).
 * Animated rotating messages shown in sequence.
 * On completion, automatically redirect to /report/[id].
 */

const MESSAGES = [
  'Reading your one-liner...',
  'Checking for buzzwords...',
  'Analysing team risk...',
  'Running the YC filter...',
  'Writing your verdict...',
]

export default function ProcessingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get('id')

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= MESSAGES.length - 1) return prev
        return prev + 1
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Redirect to report page after all messages shown
  useEffect(() => {
    if (messageIndex >= MESSAGES.length - 1) {
      const timeout = setTimeout(() => {
        if (reportId) {
          router.push(`/report/${reportId}`)
        } else {
          router.push('/dashboard')
        }
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [messageIndex, reportId, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Pulsing logo */}
      <div className="mb-12">
        <motion.h1
          className="text-5xl font-black tracking-tight"
          style={{ color: '#FF6B35' }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          YChecker
        </motion.h1>
      </div>

      {/* Spinner */}
      <div className="mb-8">
        <motion.div
          className="w-12 h-12 rounded-full"
          style={{
            border: '3px solid #DDDDDD',
            borderTop: '3px solid #FF6B35',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Rotating messages */}
      <div className="h-8 relative w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            className="text-base font-medium absolute inset-x-0"
            style={{ color: '#111111' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-8">
        {MESSAGES.map((_, index) => (
          <div
            key={index}
            className="rounded-full transition-all duration-500"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor:
                index <= messageIndex ? '#FF6B35' : '#DDDDDD',
            }}
          />
        ))}
      </div>

      {/* Subtext */}
      <p
        className="mt-8 text-sm"
        style={{ color: '#666666' }}
      >
        This usually takes 10–20 seconds
      </p>
    </div>
  )
}
