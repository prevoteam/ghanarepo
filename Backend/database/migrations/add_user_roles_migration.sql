-- Migration: Add user roles and unify login system
-- Date: 2025-11-28
-- Description: Add user_role, username, password columns to users table and migrate monitoring_login users

-- Step 1: Add new columns to users table for unified authentication
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_role VARCHAR(50) DEFAULT 'resident'
    CHECK (user_role IN ('gra_maker', 'gra_checker', 'monitoring', 'resident', 'nonresident')),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS auth_token VARCHAR(100),
ADD COLUMN IF NOT EXISTS auth_token_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Step 2: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_role ON users(user_role);
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_token ON users(auth_token);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Step 3: Insert GRA admin users (Maker, Checker, Monitoring)
-- Note: Passwords are stored as plain text (matching existing pattern)

-- GRA Maker User
INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'gra_maker', 'maker123', 'maker@gra.gov.gh', 'GRA Maker Admin',
    'gra_maker', 'email', 'maker@gra.gov.gh', TRUE, TRUE
) ON CONFLICT (username) DO NOTHING;

-- GRA Checker User
INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'gra_checker', 'checker123', 'checker@gra.gov.gh', 'GRA Checker Admin',
    'gra_checker', 'email', 'checker@gra.gov.gh', TRUE, TRUE
) ON CONFLICT (username) DO NOTHING;

-- GRA Monitoring User
INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'monitoring', 'monitoring123', 'monitoring@gra.gov.gh', 'GRA Monitoring Admin',
    'monitoring', 'email', 'monitoring@gra.gov.gh', TRUE, TRUE
) ON CONFLICT (username) DO NOTHING;

-- Step 4: Update existing users with default roles based on entity_type
UPDATE users
SET user_role = 'nonresident'
WHERE entity_type = 'NonResident' AND user_role IS NULL;

UPDATE users
SET user_role = 'resident'
WHERE entity_type IN ('DomesticIndividual', 'DomesticCompany') AND user_role IS NULL;

-- Step 5: Drop the monitoring_login table (after confirming migration success)
-- IMPORTANT: Run this only after verifying the migration worked correctly
-- DROP TABLE IF EXISTS monitoring_login;

-- Verification query - run this to check the migration
-- SELECT id, unique_id, username, email, user_role, full_name, is_active
-- FROM users
-- WHERE user_role IN ('gra_maker', 'gra_checker', 'monitoring');
