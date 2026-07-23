-- ============================================================
-- Phase 11+ — Rate Limits Table
-- Persistent store for rate limiting across serverless instances
-- ============================================================

-- Rate limits tracking table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,          -- IP address or user_id
  endpoint TEXT NOT NULL,            -- route path
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  backoff_level INTEGER DEFAULT 0,   -- for auth exponential backoff
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(identifier, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Atomic rate limit check function
-- Returns current count and backoff level, handling window resets
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_window_seconds INTEGER,
  p_max_requests INTEGER
)
RETURNS TABLE(
  current_count INTEGER,
  current_backoff INTEGER,
  current_window_start TIMESTAMPTZ,
  is_new_window BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_window_start TIMESTAMPTZ;
  v_is_new BOOLEAN := FALSE;
BEGIN
  -- Try to get existing record
  SELECT * INTO v_record
  FROM rate_limits
  WHERE identifier = p_identifier AND endpoint = p_endpoint
  FOR UPDATE;

  IF NOT FOUND THEN
    -- First request: insert new record
    INSERT INTO rate_limits (identifier, endpoint, request_count, window_start, backoff_level)
    VALUES (p_identifier, p_endpoint, 1, now(), 0)
    RETURNING * INTO v_record;
    v_is_new := TRUE;
  ELSE
    -- Check if window has expired
    IF now() > v_record.window_start + (p_window_seconds || ' seconds')::INTERVAL THEN
      -- Reset window
      UPDATE rate_limits
      SET request_count = 1,
          window_start = now(),
          backoff_level = GREATEST(v_record.backoff_level - 1, 0)  -- decay backoff
      WHERE id = v_record.id
      RETURNING * INTO v_record;
      v_is_new := TRUE;
    ELSE
      -- Increment count within window
      UPDATE rate_limits
      SET request_count = request_count + 1
      WHERE id = v_record.id
      RETURNING * INTO v_record;
    END IF;
  END IF;

  RETURN QUERY SELECT
    v_record.request_count,
    v_record.backoff_level,
    v_record.window_start,
    v_is_new;
END;
$$;

-- Function to escalate backoff level (called when auth limit exceeded)
CREATE OR REPLACE FUNCTION escalate_backoff(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_backoff INTEGER DEFAULT 4
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_level INTEGER;
BEGIN
  UPDATE rate_limits
  SET backoff_level = LEAST(backoff_level + 1, p_max_backoff),
      request_count = 0,
      window_start = now()
  WHERE identifier = p_identifier AND endpoint = p_endpoint
  RETURNING backoff_level INTO v_new_level;

  RETURN COALESCE(v_new_level, 0);
END;
$$;

-- Cleanup function: delete expired records older than 1 hour
-- Run this periodically via Supabase cron or manually
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < now() - INTERVAL '1 hour'
    AND backoff_level = 0;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
