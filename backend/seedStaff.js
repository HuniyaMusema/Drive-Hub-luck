require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/pgPool');

async function seed() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('staff123', salt);
    
    // Ensure the enum value exists (it's already in schema, but good for safety)
    await pool.query(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lottery_staff'`);
    
    await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ('Lottery Staff', 'staff@drivehub.com', $1, 'lottery_staff') 
       ON CONFLICT (email) DO UPDATE SET role = 'lottery_staff', password = $1`,
      [hash]
    );
    
    console.log('✅ Staff created/updated successfully!');
    console.log('Email: staff@drivehub.com');
    console.log('Password: staff123');
  } catch (err) {
    console.error('Error seeding staff:', err.message);
  } finally {
    process.exit(0);
  }
}

seed();

