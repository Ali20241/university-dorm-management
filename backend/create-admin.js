const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Hash the password "admin123"
const password = 'admin123';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Original password:', password);
console.log('Hashed password:', hashedPassword);

// First, clear existing admin if any
db.query('DELETE FROM admins WHERE email = ?', ['admin@university.edu'], (err) => {
  if (err) console.log('Delete error:', err.message);
  
  db.query('DELETE FROM users WHERE email = ?', ['admin@university.edu'], (err) => {
    if (err) console.log('Delete error:', err.message);
    
    // Insert new admin user
    db.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      ['admin@university.edu', hashedPassword, 'admin'],
      (err, result) => {
        if (err) {
          console.log('Error inserting user:', err.message);
          return;
        }
        
        const userId = result.insertId;
        console.log('User inserted with ID:', userId);
        
        // Insert admin details
        db.query(
          'INSERT INTO admins (user_id, first_name, last_name, email, position, department) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, 'John', 'Doe', 'admin@university.edu', 'Dormitory Manager', 'Housing Department'],
          (err) => {
            if (err) {
              console.log('Error inserting admin:', err.message);
            } else {
              console.log('✅ Admin user created successfully!');
              console.log('Email: admin@university.edu');
              console.log('Password: admin123');
            }
            db.end();
          }
        );
      }
    );
  });
});