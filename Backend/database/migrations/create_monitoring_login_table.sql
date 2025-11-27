-- Create monitoring_login table for GRA Admin Portal users
-- Run this SQL on the gra-db PostgreSQL database

CREATE TABLE IF NOT EXISTS monitoring_login (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP,
    session_id VARCHAR(100),
    auth_token VARCHAR(100),
    auth_token_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_monitoring_login_username ON monitoring_login(username);
CREATE INDEX IF NOT EXISTS idx_monitoring_login_session_id ON monitoring_login(session_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_login_auth_token ON monitoring_login(auth_token);

-- Insert a default admin user (change password before production!)
INSERT INTO monitoring_login (username, password, email, full_name, role)
VALUES ('admin', 'admin123', 'admin@gra.gov.gh', 'GRA Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Verify the table was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'monitoring_login';
