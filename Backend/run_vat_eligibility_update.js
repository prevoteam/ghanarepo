require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const updateVatEligibilityTable = async () => {
    try {
        console.log('Adding TIN and action_status columns to vat_eligibility table...');

        // Add tin column if not exists
        await pool.query(`
            ALTER TABLE vat_eligibility
            ADD COLUMN IF NOT EXISTS tin VARCHAR(50) UNIQUE
        `);
        console.log('Added tin column');

        // Add action_status column if not exists
        await pool.query(`
            ALTER TABLE vat_eligibility
            ADD COLUMN IF NOT EXISTS action_status VARCHAR(50) DEFAULT 'Pending'
        `);
        console.log('Added action_status column');

        // Create sequence for TIN generation if not exists
        await pool.query(`
            CREATE SEQUENCE IF NOT EXISTS tin_sequence START WITH 1000000 INCREMENT BY 1
        `);
        console.log('Created TIN sequence');

        await pool.end();
        console.log('Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        await pool.end();
        process.exit(1);
    }
};

updateVatEligibilityTable();
