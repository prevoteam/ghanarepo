-- Create users table for GRA registration portal
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    unique_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,

    -- Contact Information
    contact_method VARCHAR(50) CHECK (contact_method IN ('email', 'mobile')),
    contact_value VARCHAR(255) UNIQUE NOT NULL,

    -- OTP Verification
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,

    -- Entity Type
    entity_type VARCHAR(50) CHECK (entity_type IN ('DomesticIndividual', 'DomesticCompany', 'NonResident')),

    -- User Details
    full_name VARCHAR(255),
    date_of_birth DATE,
    nationality VARCHAR(100),
    gender VARCHAR(20),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),

    -- Business Details (for companies)
    company_name VARCHAR(255),
    company_registration_number VARCHAR(100),
    business_type VARCHAR(100),

    -- Tax Information
    tin VARCHAR(100) UNIQUE,
    vat_id VARCHAR(100),

    -- Credentials
    verifiable_credential JSONB,
    subject_name VARCHAR(255),
    issue_date DATE,
    credential_id VARCHAR(255),

    -- Profile
    profile_image VARCHAR(500),

    -- Agent Details
    ghana_card_number VARCHAR(50),
    agent_full_name VARCHAR(255),
    agent_email VARCHAR(255),
    agent_ghana_id VARCHAR(50),
    agent_mobile VARCHAR(50),

    -- Market Declaration (Step 5)
    sells_digital_services BOOLEAN,
    annual_sales_volume VARCHAR(50),

    -- Payment Gateway Linkage (Step 6)
    payment_provider VARCHAR(50), -- 'Stripe', 'Paystack', 'Flutterwave', 'PayPal'
    merchant_id VARCHAR(255),
    payment_connected BOOLEAN DEFAULT FALSE,
    payment_connected_at TIMESTAMP,

    -- e-VAT Obligations (Step 7)
    compliance_status VARCHAR(50), -- 'Compliant', 'Non-Compliant', 'Pending'
    vat_registration_required BOOLEAN,
    applicable_vat_rate VARCHAR(255),

    -- Dashboard Data
    total_sales DECIMAL(15, 2) DEFAULT 0.00,
    est_vat_liability DECIMAL(15, 2) DEFAULT 0.00,
    registration_completed BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_contact_value ON users(contact_value);
CREATE INDEX idx_users_unique_id ON users(unique_id);
CREATE INDEX idx_users_tin ON users(tin);
CREATE INDEX idx_users_otp_code ON users(otp_code);
CREATE INDEX idx_users_vat_id ON users(vat_id);
CREATE INDEX idx_users_merchant_id ON users(merchant_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
