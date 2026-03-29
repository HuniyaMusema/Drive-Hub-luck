require('dotenv').config({ path: 'backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

async function migrate() {
  try {
    console.log('Applying migration...');
    
    // 1. Create car_status type if not exists
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE car_status AS ENUM ('available', 'sold', 'rented', 'maintenance');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Add columns to cars table
    await pool.query(`
      ALTER TABLE cars 
      ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS status car_status NOT NULL DEFAULT 'available',
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
    `);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
