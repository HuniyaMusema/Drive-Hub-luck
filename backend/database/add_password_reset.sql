-- Add password reset columns to users table
-- Run this ONCE on your database (local or hosted)

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(512),
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;
