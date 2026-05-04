const { pool } = require('../db');
require('dotenv').config();

const getAllRequests = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mr.*, r.room_number, s.first_name, s.last_name
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      LEFT JOIN students s ON mr.student_id = s.id
      ORDER BY mr.created_at DESC
    `);
    res.json({ success: true, count: result.rows.length, requests: result.rows });
  } catch (err) {
    console.error('getAllRequests error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const submitRequest = async (req, res) => {
  const { roomId, studentId, title, description, priority } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO maintenance_requests (room_id, student_id, title, description, priority) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [roomId, studentId, title, description, priority]
    );
    res.json({ success: true, message: 'Request submitted', requestId: result.rows[0].id });
  } catch (err) {
    console.error('submitRequest error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  try {
    const completionDate = status === 'completed' ? 'NOW()' : 'NULL';
    await pool.query(
      `UPDATE maintenance_requests SET status = $1, notes = COALESCE($2, notes),
       completion_date = ${completionDate} WHERE id = $3`,
      [status, notes || null, id]
    );
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    console.error('updateRequestStatus error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllRequests, submitRequest, updateRequestStatus };
