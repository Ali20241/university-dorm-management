const { pool } = require('../db');
require('dotenv').config();

const getAllApplications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, s.first_name, s.last_name, s.student_id as student_code,
             r.room_number, r.building, r.floor, r.room_type
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN rooms r ON a.room_id = r.id
      ORDER BY a.application_date DESC
    `);
    res.json({ success: true, count: result.rows.length, applications: result.rows });
  } catch (err) {
    console.error('getAllApplications error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const submitApplication = async (req, res) => {
  const { studentId, roomId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO applications (student_id, room_id) VALUES ($1, $2) RETURNING id',
      [studentId, roomId]
    );
    res.json({ success: true, message: 'Application submitted', applicationId: result.rows[0].id });
  } catch (err) {
    console.error('submitApplication error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const approveApplication = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE applications SET status = 'approved', reviewed_date = NOW() WHERE id = $1",
      [id]
    );
    res.json({ success: true, message: 'Application approved' });
  } catch (err) {
    console.error('approveApplication error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const rejectApplication = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    await pool.query(
      "UPDATE applications SET status = 'rejected', reason = $1, reviewed_date = NOW() WHERE id = $2",
      [reason, id]
    );
    res.json({ success: true, message: 'Application rejected' });
  } catch (err) {
    console.error('rejectApplication error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllApplications, submitApplication, approveApplication, rejectApplication };
