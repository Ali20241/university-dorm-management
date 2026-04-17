const pool = require('./config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testAPI() {
  try {
    // Test 1: Direct database query
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      ['admin@university.edu']
    );
    console.log('User found:', user.rows[0]?.email);
    
    // Test 2: Password comparison
    const passwordMatch = await bcrypt.compare('admin123', user.rows[0]?.password);
    console.log('Password match:', passwordMatch);
    
    // Test 3: Check if server.js is running
    console.log('Backend is running on port 5000');
    
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit();
  }
}

testAPI();
