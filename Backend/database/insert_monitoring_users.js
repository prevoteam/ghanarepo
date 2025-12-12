require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const insertUsers = async () => {
    try {
        console.log('Connecting to database...');
        console.log('Host:', process.env.DB_HOST);
        console.log('Database:', process.env.DB_NAME);

        const users = [
            {
                username: 'jonathan.ane@kulana.net',
                password: 'Admin@1234',
                email: 'jonathan.ane@kulana.net',
                full_name: 'Jonathan Ane',
                user_role: 'monitoring',
                contact_method: 'email',
                contact_value: 'jonathan.ane@kulana.net'
            },
            {
                username: 'sharath.kumar@kulana.net',
                password: 'Admin@1234',
                email: 'sharath.kumar@kulana.net',
                full_name: 'Sharath Kumar',
                user_role: 'monitoring',
                contact_method: 'email',
                contact_value: 'sharath.kumar@kulana.net'
            },
            {
                username: 'hemanka.bharali@kulana.net',
                password: 'Admin@1234',
                email: 'hemanka.bharali@kulana.net',
                full_name: 'Hemanka Bharali',
                user_role: 'monitoring',
                contact_method: 'email',
                contact_value: 'hemanka.bharali@kulana.net'
            }
        ];

        console.log('\nInserting monitoring users...\n');

        for (const user of users) {
            // Check if user already exists
            const checkQuery = `SELECT id, username FROM users WHERE email = $1`;
            const existing = await pool.query(checkQuery, [user.email]);

            if (existing.rows.length > 0) {
                // Update existing user
                const updateQuery = `
                    UPDATE users SET
                        password = $1,
                        full_name = $2,
                        user_role = $3
                    WHERE email = $4
                    RETURNING id, username, email, user_role;
                `;
                const result = await pool.query(updateQuery, [
                    user.password,
                    user.full_name,
                    user.user_role,
                    user.email
                ]);
                console.log(`✓ User updated: ${result.rows[0].username} (${result.rows[0].user_role})`);
            } else {
                // Insert new user
                const insertQuery = `
                    INSERT INTO users (
                        unique_id, username, password, email, full_name, user_role,
                        contact_method, contact_value, is_verified, is_active
                    ) VALUES (
                        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, TRUE, TRUE
                    )
                    RETURNING id, username, email, user_role;
                `;
                const result = await pool.query(insertQuery, [
                    user.username,
                    user.password,
                    user.email,
                    user.full_name,
                    user.user_role,
                    user.contact_method,
                    user.contact_value
                ]);
                console.log(`✓ User created: ${result.rows[0].username} (${result.rows[0].user_role})`);
            }
        }

        // Verify inserted users
        console.log('\n========================================');
        console.log('Verifying inserted users:');
        console.log('========================================\n');

        const verifyResult = await pool.query(`
            SELECT id, username, email, user_role, full_name, is_active
            FROM users
            WHERE email IN ('jonathan.ane@kulana.net', 'sharath.kumar@kulana.net', 'hemanka.bharali@kulana.net')
            ORDER BY username
        `);

        verifyResult.rows.forEach(row => {
            console.log(`ID: ${row.id} | Username: ${row.username} | Role: ${row.user_role} | Active: ${row.is_active}`);
        });

        console.log('\n========================================');
        console.log(`Total users inserted/updated: ${verifyResult.rows.length}`);
        console.log('========================================\n');

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('Error inserting users:', error);
        await pool.end();
        process.exit(1);
    }
};

insertUsers();
