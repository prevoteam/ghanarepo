require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const runMigration = async () => {
    try {
        console.log('Starting notifications table migration...');
        console.log('Database:', process.env.DB_NAME);

        // Read the SQL file
        const sqlFilePath = path.join(__dirname, 'migrations', 'create_notifications_table.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        // Execute the migration
        await pool.query(sql);

        console.log('✓ Notifications table created successfully');

        // Verify table exists
        const result = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'notifications'
            ORDER BY ordinal_position
        `);

        console.log('\nNotifications table structure:');
        console.log('----------------------------------------');
        result.rows.forEach(row => {
            console.log(`${row.column_name.padEnd(20)} | ${row.data_type}`);
        });
        console.log('----------------------------------------');

        await pool.end();
        console.log('\nMigration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        await pool.end();
        process.exit(1);
    }
};

runMigration();
