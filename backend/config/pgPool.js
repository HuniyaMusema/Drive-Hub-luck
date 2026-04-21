const { Pool } = require('pg');

let pool = null;

if (process.env.DATABASE_URL) {
  // Hosted database (Supabase, Render, Railway, etc.)
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    console.log('[pgPool] PostgreSQL pool created from DATABASE_URL.');
  } catch (err) {
    console.error('[pgPool] Failed to create pool from DATABASE_URL:', err.message);
  }
} else if (process.env.PG_HOST || process.env.PG_DATABASE) {
  // Local development via individual PG_* variables
  try {
    pool = new Pool({
      host:     process.env.PG_HOST     || 'localhost',
      port:     parseInt(process.env.PG_PORT || '5432', 10),
      database: process.env.PG_DATABASE,
      user:     process.env.PG_USER,
      password: String(process.env.PG_PASSWORD || ''),
      ssl:      process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    console.log('[pgPool] PostgreSQL pool created from PG_* variables.');
  } catch (err) {
    console.error('[pgPool] Failed to create pool from PG_* variables:', err.message);
  }
} else {
  console.warn('[pgPool] No DATABASE_URL or PG_* variables found — PostgreSQL will be unavailable. Routes that depend on direct DB access will not function.');
}

if (pool) {
  pool.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.error('[pgPool] PostgreSQL connection refused! Ensure the DB is running.');
    } else {
      console.error('[pgPool] Unexpected pool error:', err.message || err);
    }
  });
}

module.exports = pool;
