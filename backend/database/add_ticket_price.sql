-- Migration: add ticket_price to lottery_settings
ALTER TABLE lottery_settings
  ADD COLUMN IF NOT EXISTS ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0;
