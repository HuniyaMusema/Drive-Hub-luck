require('dotenv').config({ path: './backend/.env' });
console.log('PG_USER:', process.env.PG_USER);
console.log('PG_DATABASE:', process.env.PG_DATABASE);
console.log('PG_PASSWORD length:', process.env.PG_PASSWORD ? process.env.PG_PASSWORD.length : 'undefined');
