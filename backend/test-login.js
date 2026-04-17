const bcrypt = require('bcryptjs');
const pool = require('./config/database');
require('dotenv').config();

async function testLogin() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    console.log('Users table exists:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does not exist! Run your schema.sql');
      process.exit();
    }
    
    // Test 2: Check for admin user
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@university.edu']
    );
    
    if (userCheck.rows.length === 0) {
      console.log('❌ Admin user not found!');
      console.log('Run this SQL in Neon:');
      console.log(`INSERT INTO users (email, password, role) VALUES ('admin@university.edu', '$2a$10$gKZqL9ZJZwQy8ZKpRzN9KOXzXzXzXzXzXzXzXzXzXzXzXzXzXz', 'admin');`);
    } else {
      console.log('✅ Admin user found:', userCheck.rows[0].email);
      
      // Test 3: Verify password
      const passwordMatch = await bcrypt.compare('admin123', userCheck.rows[0].password);
      console.log('Password "admin123" matches:', passwordMatch);
    }
    
    process.exit();
  } catch (error) {
    console.error('Database error:', error.message);
    process.exit();
  }
}

testLogin();