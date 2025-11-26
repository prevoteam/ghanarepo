-- PSP Registrations Table for Payment Service Provider On-boarding
-- Run this script to create the required table

CREATE TABLE IF NOT EXISTS psp_registrations (
    id SERIAL PRIMARY KEY,
    psp_id VARCHAR(50) UNIQUE NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    bog_license_number VARCHAR(100) UNIQUE NOT NULL,
    technical_contact_name VARCHAR(255) NOT NULL,
    official_email VARCHAR(255) NOT NULL,
    client_id VARCHAR(100) UNIQUE NOT NULL,
    client_secret VARCHAR(100) NOT NULL,
    webhook_key VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'approved',
    sandbox_url VARCHAR(255) DEFAULT 'https://sandbox-api.gra.gov.gh/v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_psp_id ON psp_registrations(psp_id);
CREATE INDEX IF NOT EXISTS idx_bog_license ON psp_registrations(bog_license_number);
CREATE INDEX IF NOT EXISTS idx_client_id ON psp_registrations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_secret ON psp_registrations(client_secret);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_psp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS psp_updated_at_trigger ON psp_registrations;
CREATE TRIGGER psp_updated_at_trigger
    BEFORE UPDATE ON psp_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_psp_updated_at();
