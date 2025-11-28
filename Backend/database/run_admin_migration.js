require('dotenv').config();
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

async function runMigration() {
    try {
        console.log('Connecting to database...');

        // Read and execute the migration file
        const migrationPath = path.join(__dirname, 'migrations', 'add_admin_user.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running admin user migration...');
        await pool.query(migrationSQL);

        console.log('Migration completed successfully!');

        // Verify the admin user was created
        const result = await pool.query(
            `SELECT id, unique_id, username, email, user_role, full_name, is_active
             FROM users
             WHERE user_role = 'admin'`
        );

        if (result.rows.length > 0) {
            console.log('\nAdmin user created:');
            console.log(result.rows[0]);
        } else {
            console.log('\nAdmin user already exists or creation was skipped.');
        }

    } catch (error) {
        console.error('Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

runMigration();
