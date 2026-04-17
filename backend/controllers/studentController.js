const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const getAllStudents = (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, count: results.length, students: results });
    }
  });
};

const getStudentById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM students WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ success: false, message: 'Student not found' });
    } else {
      res.json({ success: true, student: results[0] });
    }
  });
};

module.exports = { getAllStudents, getStudentById };