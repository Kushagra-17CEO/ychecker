'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { applicationSchema, stepSchemas, type ApplicationFormData } from '@/lib/validations'
import AuthModal from '@/components/auth-modal'
import { sanitizeApiError } from '@/lib/error-sanitizer'
import type { User } from '@supabase/supabase-js'

/* ===================================================================
 * Step configuration — one question per screen (Blueprint Section 4.3)
 * =================================================================== */
const STEPS = [
  {
    key: 'one_liner' as const,
    title: 'One-Liner',
    subtitle: 'Step 1 of 6',
    prompt: 'Describe your company in 50 characters or less.',
    placeholder: 'e.g. "We help small restaurants fill empty tables with dynamic pricing for walk-ins."',
    helperText: null,
    maxChars: 200,
    inputType: 'input' as const,
  },
  {
    key: 'problem' as const,
    title: 'Problem & Solution',
    subtitle: 'Step 2 of 6',
    prompt: 'What is the problem you\'re solving, and how does your product fix it?',
    placeholder: 'Explain the specific pain point and your solution...',
    helperText: null,
    maxChars: 5000,
    inputType: 'textarea' as const,
  },
  {
    key: 'progress' as const,
    title: 'How Far Along Are You?',
    subtitle: 'Step 3 of 6',
    prompt: 'How far along are you?',
    placeholder: 'Describe what exists today, what\'s working, and what real traction you have...',
    helperText: 'This is your strongest asset in the application. YC cares deeply about velocity. Be specific about what exists today, what\'s working, and what real traction you have. Hypotheses score lower than evidence.',
    maxChars: 5000,
    inputType: 'textarea' as const,
  },
  {
    key: 'why_this_idea' as const,
    title: 'Why Did You Pick This Idea?',
    subtitle: 'Step 4 of 6',
    prompt: 'Why did you pick this idea to work on?',
    placeholder: 'Explain your personal connection, domain expertise, or unfair advantage...',
    helperText: 'YC partners will probe your personal connection to this problem. Explain your domain expertise, lived experience, or unfair advantage — why you specifically are the right person to solve this, and what you already know that others would miss.',
    maxChars: 5000,
    inputType: 'textarea' as const,
  },
  {
    key: 'unique_insight' as const,
    title: 'Your Unique Insight',
    subtitle: 'Step 5 of 6',
    prompt: 'What do you understand about your business that other companies in it just don\'t get?',
    placeholder: 'Describe the non-obvious insight that makes your approach structurally different...',
    helperText: 'This is where your unique value proposition must stand out. Don\'t describe what competitors do wrong — describe the non-obvious insight that makes your approach structurally different and harder to copy.',
    maxChars: 5000,
    inputType: 'textarea' as const,
  },
  {
    key: 'revenue' as const,
    title: 'Revenue Model',
    subtitle: 'Step 6 of 6',
    prompt: 'How do or will you make money?',
    placeholder: 'Explain who pays, how much, and why they will...',
    helperText: 'YC wants to see a clear, direct path to revenue — not a monetisation strategy to figure out later. Be specific about who pays, how much, and why they will. If you\'re pre-revenue, explain your pricing hypothesis and what evidence supports it.',
    maxChars: 5000,
    inputType: 'textarea' as const,
  },
]

/* ===================================================================
 * Animation variants for step transitions
 * =================================================================== */
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
}

/* ===================================================================
 * Main Application Form Component
 * =================================================================== */
const STORAGE_KEY = 'ychecker_form_draft'

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingAutoSubmit, setPendingAutoSubmit] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onTouched',
    defaultValues: {
      one_liner: '',
      problem: '',
      progress: '',
      why_this_idea: '',
      unique_insight: '',
      revenue: '',
    },
  })

  // Restore saved form data on mount (survives OAuth redirect)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as ApplicationFormData
        reset(parsed)
        // Jump to last step so user can submit immediately
        setCurrentStep(STEPS.length - 1)
        setPendingAutoSubmit(true)
      }
    } catch {
      // Corrupt data — ignore
    }
  }, [reset])

  // Track auth state
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Auto-submit after OAuth redirect: user is now authenticated + form was restored
  useEffect(() => {
    if (user && pendingAutoSubmit) {
      setPendingAutoSubmit(false)
      // Small delay to let React Hook Form settle after reset
      const timer = setTimeout(() => {
        handleSubmit(submitApplication)()
      }, 100)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingAutoSubmit])

  // Save form data to sessionStorage
  const saveFormDraft = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()))
    } catch {
      // Storage full or unavailable — non-critical
    }
  }

  // Clear saved draft
  const clearFormDraft = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Non-critical
    }
  }

  // Current step field name
  const step = STEPS[currentStep]
  const fieldName = step.key
  const watchedValue = watch(fieldName) || ''

  // Validate current step before advancing
  const validateCurrentStep = useCallback(async () => {
    // Trigger validation for the current step's field
    const stepSchema = stepSchemas[currentStep]
    const fieldKeys = Object.keys(stepSchema.shape) as (keyof ApplicationFormData)[]
    const result = await trigger(fieldKeys)
    return result
  }, [currentStep, trigger])

  // Navigate to next step
  const goNext = async () => {
    const isValid = await validateCurrentStep()
    if (!isValid) return

    if (currentStep < STEPS.length - 1) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }

  // Navigate to previous step
  const goBack = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step.inputType === 'input') {
      e.preventDefault()
      goNext()
    }
  }

  // Final submit
  const onSubmit = async (data: ApplicationFormData) => {
    // Auth gate — show modal if not logged in (Blueprint Section 4.3)
    if (!user) {
      // Save form data before potential OAuth redirect
      saveFormDraft()
      setShowAuthModal(true)
      return
    }

    await submitApplication(data)
  }

  // Submit to API
  const submitApplication = async (data: ApplicationFormData) => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Submission failed. Please try again.')
      }

      const result = await response.json()
      // Clear saved draft on success
      clearFormDraft()
      // Navigate to processing screen, then to report
      router.push(`/processing?id=${result.report_id}`)
    } catch (err) {
      setSubmitError(sanitizeApiError(err, 'Something went wrong. Please try again.'))
      setSubmitting(false)
    }
  }

  // Auth modal success handler — user just signed in via email/password, retry submit
  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // Re-trigger form submit now that user is authenticated
    handleSubmit(submitApplication)()
  }

  const isLastStep = currentStep === STEPS.length - 1
  const progressPercent = ((currentStep + 1) / STEPS.length) * 100

  return (
    <>
      {/* Progress Bar — thin orange line at top (Section 7.3) */}
      <div className="progress-bar sticky top-16 z-30">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Form Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {/* Step Header */}
                <div className="mb-8">
                  <p
                    className="text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: '#FF6B35' }}
                  >
                    {step.subtitle}
                  </p>
                  <h1
                    className="text-2xl sm:text-3xl font-bold mb-2"
                    style={{ color: '#111111' }}
                  >
                    {step.title}
                  </h1>
                  <p
                    className="text-base"
                    style={{ color: '#666666' }}
                  >
                    {step.prompt}
                  </p>
                </div>

                {/* Input Field */}
                <div className="mb-6">
                  {step.inputType === 'input' ? (
                    <input
                      {...register(fieldName)}
                      type="text"
                      placeholder={step.placeholder}
                      maxLength={step.maxChars}
                      className="input text-lg"
                      onKeyDown={handleKeyDown}
                      autoFocus
                      disabled={submitting}
                    />
                  ) : (
                    <textarea
                      {...register(fieldName)}
                      placeholder={step.placeholder}
                      maxLength={step.maxChars}
                      rows={8}
                      className="input text-base resize-y min-h-[200px]"
                      autoFocus
                      disabled={submitting}
                    />
                  )}

                  {/* Character counter + helper text row */}
                  <div className="flex items-start justify-between mt-2 gap-4">
                    {/* Helper text */}
                    {step.helperText ? (
                      <p
                        className="text-xs flex-1"
                        style={{ color: '#666666' }}
                      >
                        {step.helperText}
                      </p>
                    ) : (
                      <div className="flex-1" />
                    )}

                    {/* Character counter */}
                    <p
                      className="text-xs font-medium flex-shrink-0 tabular-nums"
                      style={{
                        color:
                          watchedValue.length > step.maxChars * 0.9
                            ? '#C0392B'
                            : '#666666',
                      }}
                    >
                      {watchedValue.length.toLocaleString()}/{step.maxChars.toLocaleString()}
                    </p>
                  </div>

                  {/* Validation error */}
                  {errors[fieldName] && (
                    <p
                      className="mt-2 text-sm font-medium"
                      style={{ color: '#C0392B' }}
                    >
                      {errors[fieldName]?.message}
                    </p>
                  )}
                </div>

                {/* Submit error */}
                {submitError && isLastStep && (
                  <div
                    className="mb-6 p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: '#FFF0E8',
                      color: '#C0392B',
                      border: '1px solid #C0392B',
                    }}
                  >
                    {submitError}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4">
                  {/* Back button */}
                  {currentStep > 0 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={submitting}
                      className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 12H5" />
                        <path d="m12 19-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {/* Next / Submit button */}
                  {isLastStep ? (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <svg
                            className="animate-spin"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" opacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
                          </svg>
                          Evaluating...
                        </>
                      ) : (
                        <>
                          Evaluate My Application
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={submitting}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      Next
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </form>

          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-2 mt-12">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className="rounded-full transition-all duration-300"
                style={{
                  width: index === currentStep ? '24px' : '8px',
                  height: '8px',
                  backgroundColor:
                    index === currentStep
                      ? '#FF6B35'
                      : index < currentStep
                        ? '#FFB088'
                        : '#DDDDDD',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Auth Gate Modal — Sunk Cost Effect framing (Section 4.3) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        redirectTo="/apply"
      />
    </>
  )
}
