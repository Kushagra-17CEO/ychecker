-- YChecker Database Schema
-- Migration 001: Create all tables
-- Run this in the Supabase SQL Editor (https://xzjitdzzgoghpjwebdhf.supabase.co)

-- ============================================================
-- 1. USERS TABLE (extends Supabase Auth users)
-- ============================================================
-- Supabase Auth already creates auth.users with id, email, created_at.
-- We create a public.users table that mirrors key fields and adds our custom columns.

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  razorpay_customer_id TEXT
);

-- Automatically create a public.users row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. APPLICATIONS TABLE (each form submission)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  one_liner TEXT NOT NULL,
  problem TEXT NOT NULL,
  traction TEXT NOT NULL,
  team TEXT NOT NULL,
  competitors TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'ai' CHECK (report_type IN ('ai', 'expert')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'expert_pending', 'expert_delivered')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. REPORTS TABLE (evaluation output)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 1 AND overall_score <= 100),
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  fluff_flags JSONB DEFAULT '[]'::jsonb,
  blind_spots JSONB DEFAULT '[]'::jsonb,
  rewrite_suggestions JSONB DEFAULT '{}'::jsonb,
  sections JSONB DEFAULT '{}'::jsonb,
  the_secret_score INTEGER CHECK (the_secret_score >= 1 AND the_secret_score <= 10),
  the_secret_explanation TEXT,
  verdict TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_unlocked BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- 4. PAYMENTS TABLE (Razorpay transaction log)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('ai', 'expert')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'complete', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_application_id ON public.reports(application_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_report_id ON public.payments(report_id);
