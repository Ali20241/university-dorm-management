const pool = require('./config/database');
require('dotenv').config();

async function diagnose() {
  try {
    console.log('1. Testing connection...');
    
    // Test simple query
    const testResult = await pool.query('SELECT NOW() as time');
    console.log('✅ Database connected, time:', testResult.rows[0].time);
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'users'
    `);
    console.log('2. Users table exists:', tableCheck.rows.length > 0);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Users table does not exist! You need to run the schema.sql');
      process.exit();
    }
    
    // Check current admin
    const adminCheck = await pool.query(
      "SELECT * FROM users WHERE email = 'admin@university.edu'"
    );
    console.log('3. Admin user found:', adminCheck.rows.length > 0);
    
    if (adminCheck.rows.length > 0) {
      console.log('   Admin email:', adminCheck.rows[0].email);
      console.log('   Admin role:', adminCheck.rows[0].role);
      console.log('   Password hash length:', adminCheck.rows[0].password.length);
    }
    
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit();
  }
}

diagnose();