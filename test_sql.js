const pool = require('./backend/config/pgPool');

async function testQuery() {
  const userId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
  try {
    const result = await pool.query(`
      SELECT 
        ln.number, 
        ln.id, 
        ls.status as lottery_status, 
        c.name as prize_name, 
        p.status as payment_status, 
        p.created_at as payment_date, 
        ln.created_at as reservation_date,
        ln.status as number_status
      FROM payments p
      JOIN lottery_numbers ln ON p.lottery_number_id = ln.id
      JOIN lottery_settings ls ON ln.lottery_id = ls.id
      LEFT JOIN cars c ON ls.prize_car_id = c.id
      WHERE p.user_id = $1

      UNION ALL

      SELECT 
        ln.number, 
        ln.id, 
        ls.status as lottery_status, 
        c.name as prize_name, 
        NULL::payment_status as payment_status, 
        NULL::timestamptz as payment_date, 
        ln.created_at as reservation_date,
        ln.status as number_status
      FROM lottery_numbers ln
      JOIN lottery_settings ls ON ln.lottery_id = ls.id
      LEFT JOIN cars c ON ls.prize_car_id = c.id
      WHERE ln.user_id = $1
      AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.lottery_number_id = ln.id AND p.user_id = $1)
      
      ORDER BY COALESCE(payment_date, reservation_date) DESC
    `, [userId]);
    console.log('Query successful');
    process.exit(0);
  } catch (err) {
    console.error('Query failed:', err.message);
    process.exit(1);
  }
}

testQuery();
