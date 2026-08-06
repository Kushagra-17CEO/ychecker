-- Migration 005: Update applications table for 6-question form
-- Additive only — no drops, no recreates.

-- Rename existing columns to match new question structure
ALTER TABLE public.applications RENAME COLUMN traction TO progress;
ALTER TABLE public.applications RENAME COLUMN team TO why_this_idea;
ALTER TABLE public.applications RENAME COLUMN competitors TO unique_insight;

-- Add new column for Question 6: "How do or will you make money?"
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS revenue TEXT NOT NULL DEFAULT '';
