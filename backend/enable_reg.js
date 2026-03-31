const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

async function enableRegistration() {
  try {
    console.log('Checking security settings...');
    const { rows } = await pool.query("SELECT config_value FROM app_settings WHERE config_key = 'Security'");
    
    let security = {};
    if (rows.length > 0) {
      security = rows[0].config_value;
    }

    console.log('Current security settings:', JSON.stringify(security));
    
    security.registrationEnabled = true;

    console.log('Enabling registration...');
    await pool.query(
      `INSERT INTO app_settings (config_key, config_value, updated_at) 
       VALUES ('Security', $1, NOW()) 
       ON CONFLICT (config_key) 
       DO UPDATE SET config_value = EXCLUDED.config_value, updated_at = NOW()`,
      [security]
    );

    console.log('SUCCESS: Registration enabled in database.');
  } catch (err) {
    console.error('Error enabling registration:', err.message);
  } finally {
    await pool.end();
  }
}

enableRegistration();
