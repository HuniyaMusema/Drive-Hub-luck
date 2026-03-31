const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'car_platform_db',
  password: '171927',
  port: 5432
});

async function seed() {
  try {
    const hash = await bcrypt.hash('staff123', 10);
    
    // Ensure the enum value exists (it may have been missing in the original DB)
    await pool.query(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lottery_staff'`);
    
    await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ('Lottery Staff', 'staff@drivehub.com', $1, 'lottery_staff') 
       ON CONFLICT (email) DO UPDATE SET role = 'lottery_staff', password = $1`,
      [hash]
    );
    console.log('✅ Staff created successfully!');
    console.log('Email: staff@drivehub.com');
    console.log('Password: staff123');
  } catch (err) {
    console.error('Error seeding staff:', err);
  } finally {
    process.exit(0);
  }
}

seed();
