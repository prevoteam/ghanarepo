const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
);

async function runMigration() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connected successfully.\n');

    // Run each SQL statement separately
    const statements = [
      // Step 1: Add new columns to users table
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS user_role VARCHAR(50) DEFAULT 'resident'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS session_id VARCHAR(100)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_token VARCHAR(100)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_token_expires_at TIMESTAMP`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`,

      // Step 2: Create indexes
      `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
      `CREATE INDEX IF NOT EXISTS idx_users_user_role ON users(user_role)`,
      `CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_users_auth_token ON users(auth_token)`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,

      // Step 3: Insert GRA admin users
      `INSERT INTO users (unique_id, username, password, email, full_name, user_role, contact_method, contact_value, is_verified, is_active)
       VALUES (gen_random_uuid(), 'gra_maker', 'maker123', 'maker@gra.gov.gh', 'GRA Maker Admin', 'gra_maker', 'email', 'maker@gra.gov.gh', TRUE, TRUE)
       ON CONFLICT (username) DO NOTHING`,

      `INSERT INTO users (unique_id, username, password, email, full_name, user_role, contact_method, contact_value, is_verified, is_active)
       VALUES (gen_random_uuid(), 'gra_checker', 'checker123', 'checker@gra.gov.gh', 'GRA Checker Admin', 'gra_checker', 'email', 'checker@gra.gov.gh', TRUE, TRUE)
       ON CONFLICT (username) DO NOTHING`,

      `INSERT INTO users (unique_id, username, password, email, full_name, user_role, contact_method, contact_value, is_verified, is_active)
       VALUES (gen_random_uuid(), 'monitoring', 'monitoring123', 'monitoring@gra.gov.gh', 'GRA Monitoring Admin', 'monitoring', 'email', 'monitoring@gra.gov.gh', TRUE, TRUE)
       ON CONFLICT (username) DO NOTHING`,

      // Step 4: Update existing users with default roles
      `UPDATE users SET user_role = 'nonresident' WHERE entity_type = 'NonResident' AND (user_role IS NULL OR user_role = 'resident')`,
      `UPDATE users SET user_role = 'resident' WHERE entity_type IN ('DomesticIndividual', 'DomesticCompany') AND user_role IS NULL`
    ];

    console.log(`Running ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);

      try {
        await sequelize.query(statement);
        console.log('  ✓ Success\n');
      } catch (err) {
        console.log(`  ⚠ Warning: ${err.message}\n`);
      }
    }

    // Verify the migration
    console.log('\n=== Verifying Migration ===\n');
    const [results] = await sequelize.query(`
      SELECT id, unique_id, username, email, user_role, full_name, is_active
      FROM users
      WHERE user_role IN ('gra_maker', 'gra_checker', 'monitoring')
      ORDER BY user_role
    `);

    console.log('GRA Admin Users Created:');
    console.table(results);

    console.log('\n✓ Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigration();
