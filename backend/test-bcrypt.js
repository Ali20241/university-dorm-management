const bcrypt = require('bcryptjs');
const pool = require('./config/database');
require('dotenv').config();

async function testBcrypt() {
  try {
    // Get admin user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = 'admin@university.edu'"
    );
    
    const user = result.rows[0];
    console.log('User found:', user.email);
    console.log('Stored hash:', user.password);
    
    // Test password "admin123"
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('Password "admin123" matches:', isMatch);
    
    // If not match, create a new correct hash
    if (!isMatch) {
      const newHash = await bcrypt.hash('admin123', 10);
      console.log('New hash to use:', newHash);
      
      // Update with correct hash
      await pool.query(
        "UPDATE users SET password = $1 WHERE email = 'admin@university.edu'",
        [newHash]
      );
      console.log('✅ Password updated!');
      
      // Verify again
      const verifyResult = await pool.query(
        "SELECT * FROM users WHERE email = 'admin@university.edu'"
      );
      const verifyMatch = await bcrypt.compare('admin123', verifyResult.rows[0].password);
      console.log('Verification after update:', verifyMatch);
    }
    
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit();
  }
}

testBcrypt();