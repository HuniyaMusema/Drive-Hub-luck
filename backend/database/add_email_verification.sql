-- ============================================================
-- Email Verification Migration
-- Run once in Supabase SQL Editor (or any PostgreSQL client)
-- ============================================================

-- Step 1: Add pending_verification to the status enum
ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'pending_verification';

-- Step 2: Add verification columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified            BOOLEAN                   NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_token        VARCHAR(512),
  ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_verification_sent_at  TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS verification_resend_count  INTEGER                   NOT NULL DEFAULT 0;

-- Step 3: Mark ALL existing active users as already verified
--         so they are NOT locked out after this migration.
UPDATE users
  SET email_verified = TRUE
  WHERE status = 'active' OR status = 'suspended';

-- Step 4: Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token
  ON users(verification_token)
  WHERE verification_token IS NOT NULL;
