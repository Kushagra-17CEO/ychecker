'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { applicationSchema, stepSchemas, type ApplicationFormData } from '@/lib/validations'
import AuthModal from '@/components/auth-modal'
import type { User } from '@supabase/supabase-js'

/* ===================================================================
 * Step configuration — one question per screen (Blueprint Section 4.3)
 * =================================================================== */
const STEPS = [
  {
    key: 'one_liner' as const,
    title: 'One-Liner',
    subtitle: 'Step 1 of 5',
    prompt: 'Describe your company in one sentence.',
    placeholder: 'e.g. "We help small restaurants fill empty tables with dynamic pricing for walk-ins."',
    helperText: null,
    maxChars: 200,
    inputType: 'input' as const,
  },
  {
    key: 'problem' as const,
    title: 'Problem & Solution',
    subtitle: 'Step 2 of 5',
    prompt: 'What is broken in the world, and how does your product fix it?',
    placeholder: 'Explain the specific pain point and your solution...',
    helperText: null,
    maxChars: 5000,
    inputType: 'textarea' as const,
  },
  {
    key: 'traction' as const,
    title: 'Traction & Metrics',
    subtitle: 'Step 3 of 5',
    prompt: 'What traction do you have?',
    placeholder: 'Share your numbers — MRR, DAUs, LOIs, pilot customers...',
    helperText: 'Include real numbers — MRR, DAUs, LOIs, pilot customers. Hypotheses score lower than evidence.',
    maxChars: 5000,
    inputType: 'textarea' as const,
  },
  {
    key: 'team' as const,
    title: 'Team & Founder-Market Fit',
    subtitle: 'Step 4 of 5',
    prompt: 'Why is your team the right one to build this?',
    placeholder: 'Who writes the code? What is your domain expertise? Why do you have an unfair advantage?',
    helperText: null,
    maxChars: 5000,
    inputType: 'textarea' as const,
  },
  {
    key: 'competitors' as const,
    title: 'Competitor Landscape',
    subtitle: 'Step 5 of 5',
    prompt: 'Who are your competitors and why will you win?',
    placeholder: 'Name at least 3 competitors and explain specifically why your approach wins or is harder to replicate.',
    helperText: null,
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
export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onTouched',
    defaultValues: {
      one_liner: '',
      problem: '',
      traction: '',
      team: '',
      competitors: '',
    },
  })

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
      // Navigate to processing screen, then to report
      router.push(`/processing?id=${result.report_id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  // Auth modal success handler — user just signed in, retry submit
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
