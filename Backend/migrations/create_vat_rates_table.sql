-- Create VAT Rates Table for Maker/Checker workflow
CREATE TABLE IF NOT EXISTS vat_rates (
    id SERIAL PRIMARY KEY,
    levy_type VARCHAR(255) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    calculation_order VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'pending'
    pending_rate DECIMAL(10, 2),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    rejected_by VARCHAR(255),
    rejected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default VAT rates
INSERT INTO vat_rates (levy_type, rate, effective_date, calculation_order, status) VALUES
('GETFund Levy', 2.5, '2023-01-01', '1 (Base)', 'active'),
('NHIL', 2.5, '2023-01-01', '1 (Base)', 'active'),
('COVID-19 Health Recovery Levy', 1, '2023-01-01', '1 (Base)', 'active'),
('Standard VAT', 15, '2023-01-01', '2 (Calculated on Gross + Levies)', 'active')
ON CONFLICT DO NOTHING;
