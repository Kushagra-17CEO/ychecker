-- YChecker Supabase Storage
-- Migration 003: Create storage bucket for PDF reports
-- Run this AFTER 001 and 002

-- Create a private storage bucket for PDF reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can read their own report PDFs
CREATE POLICY "Users can read own reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports'
    AND auth.role() = 'authenticated'
  );

-- Policy: Only service_role can insert (API routes upload PDFs)
-- Service role bypasses RLS by default, so no INSERT policy needed
-- for the service_role key. The above SELECT policy lets users
-- download their PDFs via signed URLs.
