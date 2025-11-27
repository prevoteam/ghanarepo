require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function runMigration() {
    try {
        console.log('Running migration...');

        // Business Details columns (Step 3)
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_name VARCHAR(255)`);
        console.log('Added trading_name column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS service_type VARCHAR(100)`);
        console.log('Added service_type column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(500)`);
        console.log('Added website column');

        // Agent Details columns (Step 4)
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_tin VARCHAR(50)`);
        console.log('Added agent_tin column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_digital_address VARCHAR(255)`);
        console.log('Added agent_digital_address column');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
}

runMigration();
