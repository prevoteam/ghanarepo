-- Migration: Add business details and agent columns for non-resident registration flow
-- Run this migration to add missing columns

-- Business Details columns (Step 3)
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(500);

-- Agent Details columns (Step 4)
ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_tin VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_digital_address VARCHAR(255);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_trading_name ON users(trading_name);
CREATE INDEX IF NOT EXISTS idx_users_agent_tin ON users(agent_tin);
