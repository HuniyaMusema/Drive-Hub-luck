-- Add image_url column to cars table
ALTER TABLE cars ADD COLUMN IF NOT EXISTS image_url TEXT;
