const bcrypt = require('bcryptjs');
const pool = require('./config/database');
require('dotenv').config();

async function fixAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('New hash:', hashedPassword);
    
    // Update or insert admin
    await pool.query(
      `INSERT INTO users (email, password, role) 
       VALUES ($1, $2, $3)
       ON CONFLICT (email) 
       DO UPDATE SET password = $2`,
      ['admin@university.edu', hashedPassword, 'admin']
    );
    
    console.log('✅ Admin password updated successfully!');
    console.log('Email: admin@university.edu');
    console.log('Password: admin123');
    
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit();
  }
}

fixAdmin();