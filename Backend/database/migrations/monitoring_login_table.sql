-- Add new columns to existing monitoring_login table for OTP and session management

ALTER TABLE monitoring_login
ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6);

ALTER TABLE monitoring_login
ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;

ALTER TABLE monitoring_login
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);

ALTER TABLE monitoring_login
ADD COLUMN IF NOT EXISTS auth_token VARCHAR(100);

ALTER TABLE monitoring_login
ADD COLUMN IF NOT EXISTS auth_token_expires_at TIMESTAMP;

ALTER TABLE monitoring_login
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

ALTER TABLE monitoring_login
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_monitoring_login_username ON monitoring_login(username);
CREATE INDEX IF NOT EXISTS idx_monitoring_login_session_id ON monitoring_login(session_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_login_auth_token ON monitoring_login(auth_token);
