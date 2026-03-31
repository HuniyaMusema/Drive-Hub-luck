const pool = require('./config/pgPool');

async function checkStatus() {
  try {
    const { rows: pending } = await pool.query("SELECT * FROM lottery_numbers WHERE status = 'pending' LIMIT 5");
    console.log('Pending Numbers:', pending);
    
    const { rows: allCount } = await pool.query("SELECT status, count(*) FROM lottery_numbers GROUP BY status");
    console.log('Counts:', allCount);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStatus();
