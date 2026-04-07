require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./backend/config/pgPool');

async function checkUser() {
  try {
    const email = 'staff@drivehub.com';
    const password = 'staff123';
    
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (rows.length === 0) {
      console.log('User not found');
      return;
    }
    
    const user = rows[0];
    console.log('User found:', user.email);
    console.log('Stored Hash:', user.password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    const newHash = await bcrypt.hash(password, 10);
    console.log('New Hash for staff123:', newHash);
    const isNewMatch = await bcrypt.compare(password, newHash);
    console.log('New Hash match:', isNewMatch);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkUser();
