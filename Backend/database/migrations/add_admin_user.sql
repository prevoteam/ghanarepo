-- Migration: Add admin user role and insert admin user
-- Date: 2025-11-28
-- Description: Add 'admin' to user_role constraint and create admin user for user management

-- Step 1: Update user_role CHECK constraint to include 'admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_role_check;
ALTER TABLE users ADD CONSTRAINT users_user_role_check
    CHECK (user_role IN ('gra_maker', 'gra_checker', 'monitoring', 'resident', 'nonresident', 'admin'));

-- Step 2: Insert Admin User
INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'admin', 'admin123', 'admin@gra.gov.gh', 'GRA System Administrator',
    'admin', 'email', 'admin@gra.gov.gh', TRUE, TRUE
) ON CONFLICT (username) DO NOTHING;

-- Verification query
-- SELECT id, unique_id, username, email, user_role, full_name, is_active
-- FROM users
-- WHERE user_role = 'admin';
