require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const createVatEligibilityTable = async () => {
    try {
        console.log('Creating vat_eligibility table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS vat_eligibility (
                id SERIAL PRIMARY KEY,
                merchant_name VARCHAR(255) NOT NULL,
                merchant_email VARCHAR(255),
                psp_name VARCHAR(100),
                registration_status VARCHAR(50) DEFAULT 'Unregistered',
                transaction_value DECIMAL(15, 2) DEFAULT 0,
                vat_amount DECIMAL(15, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('vat_eligibility table created successfully!');

        // Insert sample data
        console.log('Inserting sample data...');

        const sampleData = [
            { merchant_name: 'Netflix Services', merchant_email: 'tax@netflix.com', psp_name: 'Stripe', registration_status: 'Registered', transaction_value: 5000000.00, vat_amount: 750000.00 },
            { merchant_name: 'Udemy Inc', merchant_email: 'compliance@udemy.com', psp_name: 'PayPal', registration_status: 'Unregistered', transaction_value: 850000.00, vat_amount: 127500.00 },
            { merchant_name: 'Zoom Video Comm', merchant_email: 'billing@zoom.us', psp_name: 'Paystack', registration_status: 'Registered', transaction_value: 2300000.00, vat_amount: 345000.00 },
            { merchant_name: 'Canva Pty Ltd', merchant_email: 'tax@canva.com', psp_name: 'Paddle', registration_status: 'Unregistered', transaction_value: 450000.00, vat_amount: 67500.00 },
            { merchant_name: 'Adobe Systems', merchant_email: 'ar@adobe.com', psp_name: 'Stripe', registration_status: 'Registered', transaction_value: 4200000.00, vat_amount: 630000.00 },
            { merchant_name: 'Spotify AB', merchant_email: 'accounts@spotify.com', psp_name: 'Adyen', registration_status: 'Unregistered', transaction_value: 980000.00, vat_amount: 147000.00 }
        ];

        for (const data of sampleData) {
            // Check if already exists
            const existing = await pool.query(
                `SELECT id FROM vat_eligibility WHERE merchant_email = $1`,
                [data.merchant_email]
            );

            if (existing.rows.length === 0) {
                await pool.query(
                    `INSERT INTO vat_eligibility (merchant_name, merchant_email, psp_name, registration_status, transaction_value, vat_amount)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [data.merchant_name, data.merchant_email, data.psp_name, data.registration_status, data.transaction_value, data.vat_amount]
                );
                console.log(`Inserted: ${data.merchant_name}`);
            } else {
                console.log(`Skipped (already exists): ${data.merchant_name}`);
            }
        }

        console.log('Sample data inserted successfully!');

        await pool.end();
        console.log('Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        await pool.end();
        process.exit(1);
    }
};

createVatEligibilityTable();
