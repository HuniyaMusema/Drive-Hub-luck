const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE,
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.error('PostgreSQL connection refused! Ensure the DB is running on port 5432.');
  } else {
    console.error('Unexpected PostgreSQL pool error:', err.message || err);
  }
});

module.exports = pool;
