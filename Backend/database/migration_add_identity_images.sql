-- Migration script to add passport and selfie image columns
-- Run this to add image path columns for Foreign Individual page

-- Add passport_image column to store passport document path
ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_image VARCHAR(500);

-- Add selfie_image column to store selfie document path
ALTER TABLE users ADD COLUMN IF NOT EXISTS selfie_image VARCHAR(500);

-- Add comments to document the columns
COMMENT ON COLUMN users.passport_image IS 'File path for uploaded passport document';
COMMENT ON COLUMN users.selfie_image IS 'File path for uploaded selfie image';
