-- YChecker Row Level Security Policies
-- Migration 002: Enable RLS and create policies
-- Run this AFTER 001_create_tables.sql

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS TABLE POLICIES
-- Users can only SELECT and UPDATE their own row
-- ============================================================

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- APPLICATIONS TABLE POLICIES
-- Users can SELECT, INSERT, and UPDATE their own applications
-- ============================================================

CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- REPORTS TABLE POLICIES
-- Users can only SELECT their own reports
-- ============================================================

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- PAYMENTS TABLE POLICIES
-- Users can only SELECT their own payments
-- ============================================================

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- SERVICE ROLE BYPASS
-- The service_role key bypasses RLS by default in Supabase.
-- API routes use the service_role key for inserting reports,
-- updating payment status, etc.
-- ============================================================
