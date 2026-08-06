import { z } from 'zod'

/**
 * Zod validation schemas for YChecker
 * Used on both client-side (React Hook Form) and server-side (API routes)
 * 6-question form per YChecker_Form_Blueprint.md
 */

// Individual field schemas
export const oneLinerSchema = z
  .string()
  .min(1, 'Your one-liner is required')
  .max(200, 'Your one-liner must be 200 characters or fewer')

export const problemSchema = z
  .string()
  .min(1, 'Problem & Solution is required')
  .max(5000, 'Problem & Solution must be 5,000 characters or fewer')

export const progressSchema = z
  .string()
  .min(1, 'Progress is required')
  .max(5000, 'Progress must be 5,000 characters or fewer')

export const whyThisIdeaSchema = z
  .string()
  .min(1, 'This field is required')
  .max(5000, 'Response must be 5,000 characters or fewer')

export const uniqueInsightSchema = z
  .string()
  .min(1, 'This field is required')
  .max(5000, 'Response must be 5,000 characters or fewer')

export const revenueSchema = z
  .string()
  .min(1, 'Revenue model is required')
  .max(5000, 'Response must be 5,000 characters or fewer')

// Step-by-step schemas for the multi-step form
export const step1Schema = z.object({
  one_liner: oneLinerSchema,
})

export const step2Schema = z.object({
  problem: problemSchema,
})

export const step3Schema = z.object({
  progress: progressSchema,
})

export const step4Schema = z.object({
  why_this_idea: whyThisIdeaSchema,
})

export const step5Schema = z.object({
  unique_insight: uniqueInsightSchema,
})

export const step6Schema = z.object({
  revenue: revenueSchema,
})

// Full application schema (all 6 fields)
export const applicationSchema = z.object({
  one_liner: oneLinerSchema,
  problem: problemSchema,
  progress: progressSchema,
  why_this_idea: whyThisIdeaSchema,
  unique_insight: uniqueInsightSchema,
  revenue: revenueSchema,
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

// Step schemas array for easy access by index
export const stepSchemas = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
]
