-- DropHook — Initial Database Schema
-- Run this in your Supabase SQL editor before starting the backend
-- ================================================================

-- Enable UUID generation (built into PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Sessions table ───────────────────────────────────────────────
-- One row per inspector session (one unique URL)
CREATE TABLE IF NOT EXISTS sessions (
  id            VARCHAR(16)  PRIMARY KEY,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ  NOT NULL,
  request_count INT          NOT NULL DEFAULT 0
);

-- ── Requests table ───────────────────────────────────────────────
-- One row per incoming webhook captured
CREATE TABLE IF NOT EXISTS requests (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   VARCHAR(16)  NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  received_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  method       VARCHAR(10)  NOT NULL,
  headers      JSONB        NOT NULL DEFAULT '{}',
  body         TEXT,
  body_size    INT          NOT NULL DEFAULT 0,
  source_ip    VARCHAR(45),
  content_type VARCHAR(255)
);

-- ── Indexes ──────────────────────────────────────────────────────
-- Speed up "get all requests for session X" query
CREATE INDEX IF NOT EXISTS idx_requests_session_id
  ON requests(session_id);

-- Speed up "newest first" ordering
CREATE INDEX IF NOT EXISTS idx_requests_received_at
  ON requests(received_at DESC);

-- ── Cleanup function ─────────────────────────────────────────────
-- Deletes expired sessions (CASCADE removes their requests too)
-- Call this via a cron job or scheduled function in Supabase
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;