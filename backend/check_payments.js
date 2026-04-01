require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD
});

p.query(`SELECT column_name FROM information_schema.columns WHERE table_name='payments'`)
  .then(r => {
    console.log('Payments table columns:');
    r.rows.forEach(row => console.log('- ' + row.column_name));
    p.end();
  })
  .catch(e => {
    console.error('ERROR:', e.message);
    p.end();
  });
