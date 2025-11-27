-- Migration script to create vat_rates table for Maker/Checker workflow
-- Run this to create the VAT rates configuration table

-- Create VAT Rates Table
CREATE TABLE IF NOT EXISTS vat_rates (
    id SERIAL PRIMARY KEY,
    levy_type VARCHAR(255) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    calculation_order VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vat_rates_status ON vat_rates(status);
CREATE INDEX IF NOT EXISTS idx_vat_rates_levy_type ON vat_rates(levy_type);

-- Insert default VAT rates (Ghana tax rates)
INSERT INTO vat_rates (levy_type, rate, effective_date, calculation_order, status)
SELECT 'GETFund Levy', 2.5, '2023-01-01', '1 (Base)', 'active'
WHERE NOT EXISTS (SELECT 1 FROM vat_rates WHERE levy_type = 'GETFund Levy');

INSERT INTO vat_rates (levy_type, rate, effective_date, calculation_order, status)
SELECT 'NHIL', 2.5, '2023-01-01', '1 (Base)', 'active'
WHERE NOT EXISTS (SELECT 1 FROM vat_rates WHERE levy_type = 'NHIL');

INSERT INTO vat_rates (levy_type, rate, effective_date, calculation_order, status)
SELECT 'COVID-19 Health Recovery Levy', 1, '2023-01-01', '1 (Base)', 'active'
WHERE NOT EXISTS (SELECT 1 FROM vat_rates WHERE levy_type = 'COVID-19 Health Recovery Levy');

INSERT INTO vat_rates (levy_type, rate, effective_date, calculation_order, status)
SELECT 'Standard VAT', 15, '2023-01-01', '2 (Calculated on Gross + Levies)', 'active'
WHERE NOT EXISTS (SELECT 1 FROM vat_rates WHERE levy_type = 'Standard VAT');
