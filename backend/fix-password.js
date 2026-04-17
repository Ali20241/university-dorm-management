const bcrypt = require('bcryptjs');
const pool = require('./config/database');
require('dotenv').config();

async function fixPassword() {
  try {
    // Hash the password "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('New hashed password:', hashedPassword);
    
    // Delete existing admin
    await pool.query('DELETE FROM users WHERE email = $1', ['admin@university.edu']);
    console.log('Deleted existing admin');
    
    // Insert new admin with correct password
    await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
      ['admin@university.edu', hashedPassword, 'admin']
    );
    console.log('Inserted new admin with correct password');
    
    // Verify
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@university.edu']);
    if (result.rows.length > 0) {
      const isValid = await bcrypt.compare('admin123', result.rows[0].password);
      console.log('Password verification:', isValid ? '✅ SUCCESS' : '❌ FAILED');
    }
    
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit();
  }
}

fixPassword();