const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const getAllRooms = (req, res) => {
  db.query('SELECT * FROM rooms', (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, count: results.length, rooms: results });
    }
  });
};

const getRoomById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM rooms WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ success: false, message: 'Room not found' });
    } else {
      res.json({ success: true, room: results[0] });
    }
  });
};

module.exports = { getAllRooms, getRoomById };