-- Migration script to add new fields to existing users table
-- Run this if the users table already exists

-- Add VAT ID
ALTER TABLE users ADD COLUMN IF NOT EXISTS vat_id VARCHAR(100);

-- Add Agent Details
ALTER TABLE users ADD COLUMN IF NOT EXISTS ghana_card_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_ghana_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_mobile VARCHAR(50);

-- Add Market Declaration (Step 5)
ALTER TABLE users ADD COLUMN IF NOT EXISTS sells_digital_services BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS annual_sales_volume VARCHAR(50);

-- Add Payment Gateway Linkage (Step 6)
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS merchant_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_connected BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_connected_at TIMESTAMP;

-- Add e-VAT Obligations (Step 7)
ALTER TABLE users ADD COLUMN IF NOT EXISTS compliance_status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vat_registration_required BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS applicable_vat_rate VARCHAR(255);

-- Add Dashboard Data
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_sales DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS est_vat_liability DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;

-- Create additional indexes
CREATE INDEX IF NOT EXISTS idx_users_vat_id ON users(vat_id);
CREATE INDEX IF NOT EXISTS idx_users_merchant_id ON users(merchant_id);

-- Update existing records to set default values
UPDATE users SET payment_connected = FALSE WHERE payment_connected IS NULL;
UPDATE users SET registration_completed = FALSE WHERE registration_completed IS NULL;
UPDATE users SET total_sales = 0.00 WHERE total_sales IS NULL;
UPDATE users SET est_vat_liability = 0.00 WHERE est_vat_liability IS NULL;
