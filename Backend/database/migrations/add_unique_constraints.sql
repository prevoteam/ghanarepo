-- Add unique constraints to users table
-- Run this migration to ensure email, tin, agent_tin, and username are unique

-- First, drop existing constraints if they exist (to avoid errors)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_contact_value_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tin_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_agent_tin_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

-- Create unique index on contact_value (email) - only for non-null values
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_contact_value_unique
ON users (contact_value)
WHERE contact_value IS NOT NULL AND contact_value != '';

-- Create unique index on tin - only for non-null values
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tin_unique
ON users (tin)
WHERE tin IS NOT NULL AND tin != '';

-- Create unique index on agent_tin - only for non-null values
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_agent_tin_unique
ON users (agent_tin)
WHERE agent_tin IS NOT NULL AND agent_tin != '';

-- Create unique index on username - only for non-null values
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
ON users (username)
WHERE username IS NOT NULL AND username != '';

-- Add comments
COMMENT ON INDEX idx_users_contact_value_unique IS 'Ensures email addresses are unique';
COMMENT ON INDEX idx_users_tin_unique IS 'Ensures TIN numbers are unique';
COMMENT ON INDEX idx_users_agent_tin_unique IS 'Ensures agent TIN numbers are unique';
COMMENT ON INDEX idx_users_username_unique IS 'Ensures usernames are unique';
