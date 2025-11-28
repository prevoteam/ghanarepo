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
        console.log('Starting user migration...');
        console.log('Database:', process.env.DB_NAME);

        // Read the SQL file
        const sqlFilePath = path.join(__dirname, 'migrations', 'add_all_users.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        // Split by semicolon and filter empty statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements to execute`);

        let successCount = 0;
        let errorCount = 0;

        for (const statement of statements) {
            try {
                if (statement.toUpperCase().startsWith('INSERT') ||
                    statement.toUpperCase().startsWith('UPDATE')) {
                    await pool.query(statement);
                    successCount++;

                    // Extract username from INSERT statement for logging
                    const usernameMatch = statement.match(/'([G|T|GHA][0-9A-Z]+)'/);
                    if (usernameMatch) {
                        console.log(`✓ User ${usernameMatch[1]} created/updated`);
                    }
                }
            } catch (err) {
                errorCount++;
                console.error(`✗ Error executing statement:`, err.message);
            }
        }

        console.log('\n========================================');
        console.log(`Migration completed!`);
        console.log(`Success: ${successCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log('========================================\n');

        // Verify users
        const result = await pool.query(`
            SELECT username, email, user_role, full_name
            FROM users
            WHERE username IN (
                'G000001', 'G000002', 'G000003', 'G000004', 'G000005', 'G000006',
                'G000007', 'G000008', 'G000009',
                'GHA000001', 'GHA000002', 'GHA000003',
                'TIN000001', 'TIN000002', 'TIN000003', 'TIN000004', 'TIN000005', 'TIN000006'
            )
            ORDER BY username
        `);

        console.log('Created Users:');
        console.log('----------------------------------------');
        result.rows.forEach(row => {
            console.log(`${row.username.padEnd(12)} | ${row.user_role.padEnd(12)} | ${row.email}`);
        });
        console.log('----------------------------------------');
        console.log(`Total: ${result.rows.length} users\n`);

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        await pool.end();
        process.exit(1);
    }
};

runMigration();
