-- Migration: Add login_role and last_login_at columns to users table
-- Run this SQL on the gra-db PostgreSQL database

-- Add login_role column to store the selected role during login session
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_role VARCHAR(20);

-- Add last_login_at column to track last login timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Add user_role column to store permanent user role (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_role VARCHAR(20) DEFAULT 'maker';

-- Optional: Add index for faster TIN/Ghana Card lookups
CREATE INDEX IF NOT EXISTS idx_users_tin ON users(tin);
CREATE INDEX IF NOT EXISTS idx_users_ghana_card ON users(ghana_card_number);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('login_role', 'last_login_at', 'user_role');
