const mysql = require('mysql2');
require('dotenv').config();

console.log('Step 1: Starting test...');
console.log('Step 2: MySQL host =', process.env.DB_HOST);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

console.log('Step 3: Connection created');

connection.connect((err) => {
  console.log('Step 4: Inside connect callback');
  
  if (err) {
    console.log('ERROR:', err.message);
    return;
  }
  
  console.log('SUCCESS! Connected to database');
  
  connection.query('SELECT * FROM rooms', (err, results) => {
    if (err) {
      console.log('Query error:', err.message);
    } else {
      console.log('Found', results.length, 'rooms');
      console.log(results);
    }
    connection.end();
  });
});
