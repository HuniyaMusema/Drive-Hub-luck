const { Pool } = require('pg');

const poolConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL,
      // If DATABASE_URL is present, we must ensure these are explicitly undefined 
      // so the pg library doesn't try to merge them with process.env.PGUSER etc.
      user: undefined,
      password: undefined,
      database: undefined,
      host: undefined,
      port: undefined,
      ssl: process.env.PG_SSL !== 'false' ? { rejectUnauthorized: false } : false,
    }
  : {
      host:     process.env.PG_HOST     || 'localhost',
      port:     parseInt(process.env.PG_PORT || '5432', 10),
      database: process.env.PG_DATABASE,
      user:     process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      ssl:      process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.error('PostgreSQL connection refused! Ensure the DB is running on port 5432.');
  } else {
    console.error('Unexpected PostgreSQL pool error:', err.message || err);
  }
});

module.exports = pool;
