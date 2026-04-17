const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const getDashboardStats = (req, res) => {
  const queries = {
    totalStudents: 'SELECT COUNT(*) as count FROM students',
    totalRooms: 'SELECT COUNT(*) as count FROM rooms',
    availableRooms: "SELECT COUNT(*) as count FROM rooms WHERE room_status = 'available'",
    pendingApplications: "SELECT COUNT(*) as count FROM applications WHERE status = 'pending'",
  };
  
  db.query(queries.totalStudents, (err, students) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    
    db.query(queries.totalRooms, (err, rooms) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      
      db.query(queries.availableRooms, (err, available) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        db.query(queries.pendingApplications, (err, pending) => {
          if (err) return res.status(500).json({ success: false, message: err.message });
          
          res.json({
            success: true,
            statistics: {
              totalStudents: students[0].count,
              totalRooms: rooms[0].count,
              availableRooms: available[0].count,
              pendingApplications: pending[0].count,
            }
          });
        });
      });
    });
  });
};

module.exports = { getDashboardStats };