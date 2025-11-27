require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function runVATRatesMigration() {
    try {
        console.log('Running VAT Rates migration...');

        // Create vat_rates table
        await pool.query(`
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
            )
        `);
        console.log('Created vat_rates table');

        // Create indexes
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_vat_rates_status ON vat_rates(status)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_vat_rates_levy_type ON vat_rates(levy_type)`);
        console.log('Created indexes');

        // Insert default VAT rates if not exists
        const defaultRates = [
            { levy_type: 'GETFund Levy', rate: 2.5, calculation_order: '1 (Base)' },
            { levy_type: 'NHIL', rate: 2.5, calculation_order: '1 (Base)' },
            { levy_type: 'COVID-19 Health Recovery Levy', rate: 1, calculation_order: '1 (Base)' },
            { levy_type: 'Standard VAT', rate: 15, calculation_order: '2 (Calculated on Gross + Levies)' }
        ];

        for (const rate of defaultRates) {
            const exists = await pool.query(
                'SELECT 1 FROM vat_rates WHERE levy_type = $1',
                [rate.levy_type]
            );

            if (exists.rows.length === 0) {
                await pool.query(
                    `INSERT INTO vat_rates (levy_type, rate, effective_date, calculation_order, status)
                     VALUES ($1, $2, '2023-01-01', $3, 'active')`,
                    [rate.levy_type, rate.rate, rate.calculation_order]
                );
                console.log(`Inserted: ${rate.levy_type}`);
            } else {
                console.log(`Skipped (already exists): ${rate.levy_type}`);
            }
        }

        console.log('VAT Rates migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
}

runVATRatesMigration();
