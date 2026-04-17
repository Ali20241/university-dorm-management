const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const getAllApplications = (req, res) => {
  const query = `
    SELECT a.*, s.first_name, s.last_name, s.student_id, r.room_number 
    FROM applications a
    JOIN students s ON a.student_id = s.id
    JOIN rooms r ON a.room_id = r.id
    ORDER BY a.application_date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, count: results.length, applications: results });
    }
  });
};

const submitApplication = (req, res) => {
  const { studentId, roomId } = req.body;
  
  db.query('INSERT INTO applications (student_id, room_id) VALUES (?, ?)', 
    [studentId, roomId], 
    (err, result) => {
      if (err) {
        res.status(500).json({ success: false, message: err.message });
      } else {
        res.json({ success: true, message: 'Application submitted', applicationId: result.insertId });
      }
    }
  );
};

const approveApplication = (req, res) => {
  const { id } = req.params;
  
  db.query('UPDATE applications SET status = "approved", reviewed_date = NOW() WHERE id = ?', 
    [id], 
    (err) => {
      if (err) {
        res.status(500).json({ success: false, message: err.message });
      } else {
        res.json({ success: true, message: 'Application approved' });
      }
    }
  );
};

const rejectApplication = (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  db.query('UPDATE applications SET status = "rejected", reason = ?, reviewed_date = NOW() WHERE id = ?', 
    [reason, id], 
    (err) => {
      if (err) {
        res.status(500).json({ success: false, message: err.message });
      } else {
        res.json({ success: true, message: 'Application rejected' });
      }
    }
  );
};

module.exports = { getAllApplications, submitApplication, approveApplication, rejectApplication };