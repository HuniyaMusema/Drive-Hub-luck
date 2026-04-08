const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env'), override: true });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function run() {
  try {
    await pool.query('ALTER TABLE lottery_settings ADD COLUMN IF NOT EXISTS ticket_price NUMERIC(12, 2) NOT NULL DEFAULT 0;');
    console.log('Migration successful: ticket_price added to lottery_settings');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
