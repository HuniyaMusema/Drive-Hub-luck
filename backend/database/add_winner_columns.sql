-- Migration: Add winner tracking columns to lottery_settings
-- Run this once against your database if these columns don't exist yet.

ALTER TABLE lottery_settings
  ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS winning_number INTEGER;
