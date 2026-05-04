const { pool } = require('../db');
require('dotenv').config();

const getDashboardStats = async (req, res) => {
  try {
    const [students, rooms, available, pending, maintenance] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM students'),
      pool.query('SELECT COUNT(*) as count FROM rooms'),
      pool.query("SELECT COUNT(*) as count FROM rooms WHERE room_status = 'available'"),
      pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'open' OR status = 'pending'"),
    ]);

    res.json({
      success: true,
      statistics: {
        totalStudents: parseInt(students.rows[0].count),
        totalRooms: parseInt(rooms.rows[0].count),
        availableRooms: parseInt(available.rows[0].count),
        pendingApplications: parseInt(pending.rows[0].count),
        openMaintenance: parseInt(maintenance.rows[0].count),
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats };
