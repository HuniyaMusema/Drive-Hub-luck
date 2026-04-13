const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
  // Hosted database (Supabase, Render, Railway, etc.)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // Local development
  pool = new Pool({
    host:     process.env.PG_HOST     || 'localhost',
    port:     parseInt(process.env.PG_PORT || '5432', 10),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: String(process.env.PG_PASSWORD || ''),
    ssl:      process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
}

pool.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.error('PostgreSQL connection refused! Ensure the DB is running.');
  } else {
    console.error('Unexpected PostgreSQL pool error:', err.message || err);
  }
});

module.exports = pool;
