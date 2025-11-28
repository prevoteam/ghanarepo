-- Migration: Add all users according to their roles
-- Date: 2025-11-28
-- Description: Insert all GRA admin users (Maker, Checker, Monitoring) and Taxpayer users

-- =============================================
-- GRA LOGIN - MAKER USERS
-- =============================================
INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'G000001', 'Admin@1234', 'Babina.d@gmail.com', 'GRA Maker 1',
    'gra_maker', 'email', 'Babina.d@gmail.com', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Babina.d@gmail.com';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'G000003', 'Admin@1234', 'ashishc@proteantech.in', 'GRA Maker 2',
    'gra_maker', 'email', 'ashishc@proteantech.in', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'ashishc@proteantech.in';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'G000005', 'Admin@1234', 'Sharath.kumar@kulana.net', 'GRA Maker 3',
    'gra_maker', 'email', 'Sharath.kumar@kulana.net', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Sharath.kumar@kulana.net';

-- =============================================
-- GRA LOGIN - CHECKER USERS
-- =============================================
INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'G000002', 'Admin@1234', 'Babina.d@gmail.com', 'GRA Checker 1',
    'gra_checker', 'email', 'Babina.d@gmail.com', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Babina.d@gmail.com';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'G000004', 'Admin@1234', 'ashishc@proteantech.in', 'GRA Checker 2',
    'gra_checker', 'email', 'ashishc@proteantech.in', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'ashishc@proteantech.in';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'G000006', 'Admin@1234', 'Sharath.kumar@kulana.net', 'GRA Checker 3',
    'gra_checker', 'email', 'Sharath.kumar@kulana.net', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Sharath.kumar@kulana.net';

-- =============================================
-- GRA LOGIN - MONITORING USERS
-- =============================================
INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'G000007', 'Admin@1234', 'Babina.d@gmail.com', 'GRA Monitoring 1',
    'monitoring', 'email', 'Babina.d@gmail.com', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Babina.d@gmail.com';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'G000008', 'Admin@1234', 'ashishc@proteantech.in', 'GRA Monitoring 2',
    'monitoring', 'email', 'ashishc@proteantech.in', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'ashishc@proteantech.in';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'G000009', 'Admin@1234', 'Sharath.kumar@kulana.net', 'GRA Monitoring 3',
    'monitoring', 'email', 'Sharath.kumar@kulana.net', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Sharath.kumar@kulana.net';

-- =============================================
-- RESIDENT TAXPAYER LOGIN USERS (with GHA/TIN format)
-- =============================================
INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'GHA000001', 'Admin@1234', 'Babina.d@gmail.com', 'Resident Taxpayer 1',
    'resident', 'email', 'Babina.d@gmail.com', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Babina.d@gmail.com';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'TIN000001', 'Admin@1234', 'Babina.d@gmail.com', 'Resident Taxpayer 1 (TIN)',
    'resident', 'email', 'Babina.d@gmail.com', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Babina.d@gmail.com';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'GHA000002', 'Admin@1234', 'ashishc@proteantech.in', 'Resident Taxpayer 2',
    'resident', 'email', 'ashishc@proteantech.in', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'ashishc@proteantech.in';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'TIN000002', 'Admin@1234', 'ashishc@proteantech.in', 'Resident Taxpayer 2 (TIN)',
    'resident', 'email', 'ashishc@proteantech.in', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'ashishc@proteantech.in';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'GHA000003', 'Admin@1234', 'Sharath.kumar@kulana.net', 'Resident Taxpayer 3',
    'resident', 'email', 'Sharath.kumar@kulana.net', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Sharath.kumar@kulana.net';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'TIN000003', 'Admin@1234', 'Sharath.kumar@kulana.net', 'Resident Taxpayer 3 (TIN)',
    'resident', 'email', 'Sharath.kumar@kulana.net', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Sharath.kumar@kulana.net';

-- =============================================
-- NONRESIDENT TAXPAYER LOGIN USER
-- =============================================
INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'TIN000004', 'Admin@1234', 'Babina.d@gmail.com', 'Nonresident Taxpayer 1',
    'nonresident', 'email', 'Babina.d@gmail.com', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Babina.d@gmail.com';

-- =============================================
-- RESIDENT TAXPAYER LOGIN USERS (TIN only format)
-- =============================================
INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'TIN000005', 'Admin@1234', 'ashishc@proteantech.in', 'Resident Taxpayer 4',
    'resident', 'email', 'ashishc@proteantech.in', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'ashishc@proteantech.in';

INSERT INTO users (
    unique_id, username, password, email, full_name, user_role,
    contact_method, contact_value, is_verified, is_active
) VALUES (
    gen_random_uuid(), 'TIN000006', 'Admin@1234', 'Sharath.kumar@kulana.net', 'Resident Taxpayer 5',
    'resident', 'email', 'Sharath.kumar@kulana.net', TRUE, TRUE
) ON CONFLICT (username) DO UPDATE SET password = 'Admin@1234', email = 'Sharath.kumar@kulana.net';

-- =============================================
-- VERIFICATION QUERY
-- =============================================
-- Run this to verify all users were created:
-- SELECT username, email, user_role, full_name, is_active FROM users ORDER BY username;
