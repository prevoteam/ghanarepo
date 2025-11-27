/**
 * Migration: Add user_role column to users table
 * Run this script to add the user_role column and update existing records
 */

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
  const client = await pool.connect();

  try {
    console.log('Starting migration: Adding user_role column...');

    // Start transaction
    await client.query('BEGIN');

    // 1. Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'user_role'
    `);

    if (checkColumn.rows.length === 0) {
      // 2. Add user_role column with default value 'maker'
      await client.query(`
        ALTER TABLE users
        ADD COLUMN user_role VARCHAR(20) DEFAULT 'maker'
      `);
      console.log('Added user_role column to users table');
    } else {
      console.log('user_role column already exists');
    }

    // 3. Update existing records - alternate between maker and checker
    // First, get all user IDs
    const users = await client.query('SELECT id FROM users ORDER BY id');

    for (let i = 0; i < users.rows.length; i++) {
      const role = i % 2 === 0 ? 'maker' : 'checker';
      await client.query(
        'UPDATE users SET user_role = $1 WHERE id = $2',
        [role, users.rows[i].id]
      );
    }

    console.log(`Updated ${users.rows.length} user records with maker/checker roles`);

    // Commit transaction
    await client.query('COMMIT');
    console.log('Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
