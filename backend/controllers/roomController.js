const { pool } = require('../db');
require('dotenv').config();

const getAllRooms = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY room_number');
    res.json({ success: true, count: result.rows.length, rooms: result.rows });
  } catch (err) {
    console.error('getAllRooms error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRoomById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, room: result.rows[0] });
  } catch (err) {
    console.error('getRoomById error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllRooms, getRoomById };
