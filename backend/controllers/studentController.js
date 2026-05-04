const { pool } = require('../db');
require('dotenv').config();

const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.email, u.created_at as registered_at
       FROM students s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.first_name, s.last_name`
    );
    res.json({ success: true, count: result.rows.length, students: result.rows });
  } catch (err) {
    console.error('getAllStudents error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.*, u.email, u.created_at as registered_at
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, student: result.rows[0] });
  } catch (err) {
    console.error('getStudentById error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllStudents, getStudentById };
