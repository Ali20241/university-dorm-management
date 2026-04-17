const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const getAllRequests = (req, res) => {
  const query = `
    SELECT mr.*, r.room_number, s.first_name, s.last_name
    FROM maintenance_requests mr
    JOIN rooms r ON mr.room_id = r.id
    LEFT JOIN students s ON mr.student_id = s.id
    ORDER BY mr.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, count: results.length, requests: results });
    }
  });
};

const submitRequest = (req, res) => {
  const { roomId, studentId, title, description, priority } = req.body;
  
  db.query(
    'INSERT INTO maintenance_requests (room_id, student_id, title, description, priority) VALUES (?, ?, ?, ?, ?)',
    [roomId, studentId, title, description, priority],
    (err, result) => {
      if (err) {
        res.status(500).json({ success: false, message: err.message });
      } else {
        res.json({ success: true, message: 'Request submitted', requestId: result.insertId });
      }
    }
  );
};

const updateRequestStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.query('UPDATE maintenance_requests SET status = ? WHERE id = ?', 
    [status, id], 
    (err) => {
      if (err) {
        res.status(500).json({ success: false, message: err.message });
      } else {
        res.json({ success: true, message: 'Status updated' });
      }
    }
  );
};

module.exports = { getAllRequests, submitRequest, updateRequestStatus };