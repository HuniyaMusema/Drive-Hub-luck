const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

async function resetUsers() {
  const adminEmail = 'admin@drivehub.com';
  const adminPassword = 'admin123';
  const adminName = 'Platform Admin';

  try {
    console.log('Connecting to database...');
    
    // 1. Truncate users table (will cascade to others)
    console.log('Clearing existing users and related data...');
    await pool.query('TRUNCATE TABLE users CASCADE');

    // 2. Hash admin password
    console.log('Creating admin account...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 3. Insert admin
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, 'admin') 
       RETURNING id`,
      [adminName, adminEmail, hashedPassword]
    );

    console.log('\nSUCCESS!');
    console.log('---------------------------');
    console.log(`Admin Account Created:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role: admin`);
    console.log('---------------------------');
    console.log('\nYou can now register as a regular user.');

  } catch (err) {
    console.error('Error resetting users:', err.message);
  } finally {
    await pool.end();
  }
}

resetUsers();
