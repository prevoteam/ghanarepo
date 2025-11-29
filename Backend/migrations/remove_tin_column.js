/**
 * Migration: Remove tin column from users table and use only agent_tin
 * Run this script to migrate data from tin to agent_tin and drop the tin column
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
    console.log('Starting migration: Remove tin column and use only agent_tin...');

    // Start transaction
    await client.query('BEGIN');

    // 1. Check if tin column exists
    const checkTinColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'tin'
    `);

    if (checkTinColumn.rows.length === 0) {
      console.log('tin column does not exist - migration already completed');
      await client.query('COMMIT');
      return;
    }

    // 2. Check if agent_tin column exists
    const checkAgentTinColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'agent_tin'
    `);

    if (checkAgentTinColumn.rows.length === 0) {
      // Create agent_tin column if it doesn't exist
      await client.query(`
        ALTER TABLE users
        ADD COLUMN agent_tin VARCHAR(50)
      `);
      console.log('Created agent_tin column');
    }

    // 3. Migrate data: Copy tin values to agent_tin where agent_tin is null
    const migrateResult = await client.query(`
      UPDATE users
      SET agent_tin = tin
      WHERE agent_tin IS NULL AND tin IS NOT NULL
    `);
    console.log(`Migrated ${migrateResult.rowCount} records from tin to agent_tin`);

    // 4. Drop the tin column
    await client.query(`
      ALTER TABLE users
      DROP COLUMN tin
    `);
    console.log('Dropped tin column from users table');

    // 5. Add index on agent_tin for better query performance
    const checkIndex = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'users' AND indexname = 'idx_users_agent_tin'
    `);

    if (checkIndex.rows.length === 0) {
      await client.query(`
        CREATE INDEX idx_users_agent_tin ON users(agent_tin)
      `);
      console.log('Created index on agent_tin column');
    }

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
