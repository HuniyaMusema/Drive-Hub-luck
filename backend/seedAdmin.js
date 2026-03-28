require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/pgPool');

async function seedAdmin() {
  try {
    const email = 'admin@drivehub.com';
    const password = '123456';

    // Check if admin already exists
    const { rows: existing } = await pool.query(
      'SELECT id, role FROM users WHERE email = $1',
      [email]
    );

    if (existing.length > 0) {
      if (existing[0].role !== 'admin') {
        await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
        console.log(`Existing user promoted to admin: ${email}`);
      } else {
        console.log(`Admin already exists: ${email}`);
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await pool.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin')`,
        ['Admin', email, hashedPassword]
      );
      console.log('Admin user created!');
      console.log(`  Email:    ${email}`);
      console.log(`  Password: ${password}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
    console.log('Done.');
  }
}

seedAdmin();
