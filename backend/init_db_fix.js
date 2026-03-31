const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:171927@localhost:5432/car_platform_db' });

async function run() {
  try {
    console.log('Initializing notifications table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('Notifications table initialized successfully');
    process.exit(0);
  } catch (e) {
    console.error('Initialization failed:', e);
    process.exit(1);
  }
}

run();
