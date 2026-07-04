import { z } from 'zod'

/**
 * Zod validation schemas for YChecker
 * Used on both client-side (React Hook Form) and server-side (API routes)
 * See Blueprint Section 10.4 for max character limits
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

export const tractionSchema = z
  .string()
  .min(1, 'Traction & Metrics is required')
  .max(5000, 'Traction & Metrics must be 5,000 characters or fewer')

export const teamSchema = z
  .string()
  .min(1, 'Team & Founder-Market Fit is required')
  .max(5000, 'Team & Founder-Market Fit must be 5,000 characters or fewer')

export const competitorsSchema = z
  .string()
  .min(1, 'Competitor Landscape is required')
  .max(5000, 'Competitor Landscape must be 5,000 characters or fewer')

// Step-by-step schemas for the multi-step form
export const step1Schema = z.object({
  one_liner: oneLinerSchema,
})

export const step2Schema = z.object({
  problem: problemSchema,
})

export const step3Schema = z.object({
  traction: tractionSchema,
})

export const step4Schema = z.object({
  team: teamSchema,
})

export const step5Schema = z.object({
  competitors: competitorsSchema,
})

// Full application schema (all 5 fields)
export const applicationSchema = z.object({
  one_liner: oneLinerSchema,
  problem: problemSchema,
  traction: tractionSchema,
  team: teamSchema,
  competitors: competitorsSchema,
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

// Step schemas array for easy access by index
export const stepSchemas = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
]
