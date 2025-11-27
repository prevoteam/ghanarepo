-- Migration: Add password column to users table for non-resident registration
-- Run this SQL on the gra-db PostgreSQL database

-- Add password column (plain text)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'password';
