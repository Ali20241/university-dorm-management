const { Pool } = require('pg');
require('dotenv').config();

console.log('Testing connection to:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✓ Database connected successfully!');
    console.log('Server time:', result.rows[0].current_time);
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();