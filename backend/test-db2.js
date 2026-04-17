const pool = require('./config/database');

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✓ Database connected!');
    console.log('Current time:', result.rows[0].current_time);
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();