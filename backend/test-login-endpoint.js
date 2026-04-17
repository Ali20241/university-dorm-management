const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/database');
require('dotenv').config();

async function testLoginEndpoint() {
  const email = 'admin@university.edu';
  const password = 'admin123';
  
  try {
    console.log('Testing login with:', email);
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('User not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('User found:', user.email);
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);
    
    if (passwordMatch) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log('✅ Login successful!');
      console.log('Token generated:', token.substring(0, 50) + '...');
      console.log('User:', { id: user.id, email: user.email, role: user.role });
    } else {
      console.log('❌ Invalid password');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit();
}

testLoginEndpoint();