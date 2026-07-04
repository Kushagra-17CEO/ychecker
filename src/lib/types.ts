/**
 * YChecker Database Types
 * Mirror of the Supabase database schema for type safety
 */

// ============================================================
// Database Row Types
// ============================================================

export interface User {
  id: string
  email: string
  created_at: string
  razorpay_customer_id: string | null
}

export interface Application {
  id: string
  user_id: string
  one_liner: string
  problem: string
  traction: string
  team: string
  competitors: string
  report_type: 'ai' | 'expert'
  status: 'pending' | 'processing' | 'complete' | 'expert_pending' | 'expert_delivered'
  created_at: string
}

export interface SectionEvaluation {
  score: number
  strengths: string[]
  weaknesses: string[]
  fluff_flags: string[]
  rewrite_suggestion: string
}

export interface ReportSections {
  one_liner: SectionEvaluation
  problem: SectionEvaluation
  traction: SectionEvaluation
  team: SectionEvaluation
  competitors: SectionEvaluation
}

export interface Report {
  id: string
  application_id: string
  user_id: string
  overall_score: number
  strengths: string[]
  weaknesses: string[]
  fluff_flags: string[]
  blind_spots: string[]
  rewrite_suggestions: Record<string, string>
  sections: ReportSections
  the_secret_score: number
  the_secret_explanation: string
  verdict: string
  pdf_url: string | null
  created_at: string
  is_unlocked: boolean
}

export interface Payment {
  id: string
  user_id: string
  report_id: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  amount: number
  tier: 'ai' | 'expert'
  status: 'pending' | 'complete' | 'failed'
  created_at: string
}

// ============================================================
// API Request/Response Types
// ============================================================

export interface EvaluateRequest {
  one_liner: string
  problem: string
  traction: string
  team: string
  competitors: string
}

export interface GeminiEvaluationResponse {
  overall_score: number
  verdict: string
  sections: ReportSections
  blind_spots: string[]
  the_secret_score: number
  the_secret_explanation: string
}

export interface CreateOrderRequest {
  report_id: string
  tier: 'ai' | 'expert'
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
  report_id: string
  tier: 'ai' | 'expert'
}

// ============================================================
// UI Types
// ============================================================

export interface ApplicationFormData {
  one_liner: string
  problem: string
  traction: string
  team: string
  competitors: string
}

export type ScoreColor = 'red' | 'amber' | 'green'

export function getScoreColor(score: number): ScoreColor {
  if (score < 50) return 'red'
  if (score < 75) return 'amber'
  return 'green'
}

export const SCORE_COLORS: Record<ScoreColor, string> = {
  red: '#C0392B',
  amber: '#D68910',
  green: '#1A7F4B',
}

// ============================================================
// Pricing Constants
// ============================================================

export const PRICING = {
  ai: {
    label: 'AI Report',
    priceUSD: 19.99,
    priceINR: 1670,
    amountPaise: 167000,
  },
  expert: {
    label: 'Expert Review',
    priceUSD: 79.99,
    priceINR: 6670,
    amountPaise: 667000,
  },
} as const
