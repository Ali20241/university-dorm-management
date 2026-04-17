const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Email Service
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

// ========== EMAIL CONFIGURATION ==========
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"University Dormitory" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

// Email Templates
const sendApprovalEmail = async (studentEmail, studentName, roomNumber) => {
  const subject = '🎉 Room Application Approved!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #5B5CE2;">🏛️ University Dormitory</h2>
      <h3>Congratulations, ${studentName}! 🎉</h3>
      <p>Your room application has been <strong style="color: #22C55E;">APPROVED</strong>.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Room Number:</strong> ${roomNumber}</p>
        <p><strong>Status:</strong> Active</p>
      </div>
      <p>You can now view your room assignment in your dashboard.</p>
      <a href="http://localhost:3000/student/assignment" style="background: #5B5CE2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">View My Room</a>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6B7280; font-size: 12px;">University Dormitory Management System</p>
    </div>
  `;
  return await sendEmail(studentEmail, subject, html);
};

const sendRejectionEmail = async (studentEmail, studentName, reason) => {
  const subject = 'Room Application Update';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #5B5CE2;">🏛️ University Dormitory</h2>
      <h3>Hello ${studentName},</h3>
      <p>Your room application has been <strong style="color: #EF4444;">REJECTED</strong>.</p>
      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Reason:</strong> ${reason || 'No specific reason provided'}</p>
      </div>
      <p>You can apply for another room.</p>
      <a href="http://localhost:3000/student/rooms" style="background: #5B5CE2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Browse Rooms</a>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6B7280; font-size: 12px;">University Dormitory Management System</p>
    </div>
  `;
  return await sendEmail(studentEmail, subject, html);
};

const sendMaintenanceEmail = async (studentEmail, studentName, title, status) => {
  const subject = `🔧 Maintenance Request ${status.toUpperCase()}`;
  const statusColor = status === 'completed' ? '#22C55E' : '#F59E0B';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #5B5CE2;">🏛️ University Dormitory</h2>
      <h3>Hello ${studentName},</h3>
      <p>Your maintenance request has been updated.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Status:</strong> <span style="color: ${statusColor};">${status.toUpperCase()}</span></p>
      </div>
      <p>Log in to your dashboard for more details.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6B7280; font-size: 12px;">University Dormitory Management System</p>
    </div>
  `;
  return await sendEmail(studentEmail, subject, html);
};

const sendPenaltyEmail = async (studentEmail, studentName, amount, reason) => {
  const subject = '⚠️ Penalty Notice';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #5B5CE2;">🏛️ University Dormitory</h2>
      <h3>Hello ${studentName},</h3>
      <p>A penalty has been issued to your account.</p>
      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount:</strong> ETB ${amount}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>Please check your dashboard for payment details.</p>
      <a href="http://localhost:3000/student/payments" style="background: #5B5CE2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">View Payments</a>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6B7280; font-size: 12px;">University Dormitory Management System</p>
    </div>
  `;
  return await sendEmail(studentEmail, subject, html);
};

// ========== MIDDLEWARE ==========
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Create uploads folder if not exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ========== TEST ROUTES ==========
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy' });
});

// ========== ROOM ROUTES ==========
app.get('/api/rooms', (req, res) => {
  db.query('SELECT id, room_number, floor, building, room_type, capacity, current_occupancy, room_status, amenities, description, image_url, created_at, updated_at FROM rooms', (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, count: results.length, rooms: results });
    }
  });
});

// ========== AUTH ROUTES ==========
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email);
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, users) => {
    if (err) {
      console.log('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (users.length === 0) {
      console.log('User not found:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('Wrong password for:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('Login successful:', email);
    res.json({ 
      success: true, 
      message: 'Login successful', 
      token, 
      user: { id: user.id, email: user.email, role: user.role } 
    });
  });
});

// Student Registration
app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName, studentId, phone, major, year, gender } = req.body;
  console.log('Registration attempt:', email);
  db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.log('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (results.length > 0) {
      console.log('Email already exists:', email);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, 'student'],
        (err, userResult) => {
          if (err) {
            console.log('User insert error:', err);
            return res.status(500).json({ success: false, message: 'Failed to create user' });
          }
          db.query(
            `INSERT INTO students (user_id, student_id, first_name, last_name, email, phone, major, year, gender, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [userResult.insertId, studentId, firstName, lastName, email, phone || null, major || null, year || null, gender || null],
            (err) => {
              if (err) {
                console.log('Student insert error:', err);
                return res.status(500).json({ success: false, message: 'Failed to create student profile' });
              }
              const token = jwt.sign(
                { id: userResult.insertId, email: email, role: 'student' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
              );
              console.log('Registration successful:', email);
              res.json({
                success: true,
                message: 'Registration successful',
                token,
                user: { id: userResult.insertId, email: email, role: 'student', firstName, lastName }
              });
            }
          );
        }
      );
    } catch (error) {
      console.log('Registration error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// ========== ADMIN ROUTES ==========

// Admin Dashboard Statistics
app.get('/api/admin/dashboard', (req, res) => {
  const queries = {
    totalStudents: 'SELECT COUNT(*) as count FROM students',
    totalRooms: 'SELECT COUNT(*) as count FROM rooms',
    availableRooms: "SELECT COUNT(*) as count FROM rooms WHERE room_status = 'available'",
    pendingApplications: "SELECT COUNT(*) as count FROM applications WHERE status = 'pending'",
    openMaintenance: "SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'open'"
  };
  db.query(queries.totalStudents, (err, students) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.query(queries.totalRooms, (err, rooms) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      db.query(queries.availableRooms, (err, available) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        db.query(queries.pendingApplications, (err, pending) => {
          if (err) return res.status(500).json({ success: false, message: err.message });
          db.query(queries.openMaintenance, (err, maintenance) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({
              success: true,
              statistics: {
                totalStudents: students[0].count,
                totalRooms: rooms[0].count,
                availableRooms: available[0].count,
                pendingApplications: pending[0].count,
                openMaintenance: maintenance[0].count
              }
            });
          });
        });
      });
    });
  });
});

// Get all students
app.get('/api/admin/students', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, count: results.length, students: results });
    }
  });
});

// Delete student
app.delete('/api/admin/students/:id/delete', (req, res) => {
  const { id } = req.params;
  db.query('SELECT user_id FROM students WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const user_id = results[0].user_id;
    db.query('DELETE FROM students WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      db.query('DELETE FROM users WHERE id = ?', [user_id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Student deleted successfully' });
      });
    });
  });
});

// Admin - Change Student Password
app.put('/api/admin/students/:id/change-password', async (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);
    db.query('SELECT user_id FROM students WHERE id = ?', [id], (err, studentResults) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (studentResults.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      const user_id = studentResults[0].user_id;
      db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user_id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Password changed successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single student details
app.get('/api/admin/students/:id/details', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT s.*, u.email, 
           r.room_number, r.building, r.floor, r.room_type,
           ra.assignment_date, ra.status as assignment_status
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN room_assignments ra ON s.id = ra.student_id AND ra.status = 'active'
    LEFT JOIN rooms r ON ra.room_id = r.id
    WHERE s.id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student: results[0] });
  });
});

// Get student's payment history
app.get('/api/admin/students/:id/payments', (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM payments WHERE student_id = ? ORDER BY due_date DESC`, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, payments: results });
  });
});

// Get student's maintenance requests
app.get('/api/admin/students/:id/maintenance', (req, res) => {
  const { id } = req.params;
  db.query(`SELECT mr.*, r.room_number FROM maintenance_requests mr JOIN rooms r ON mr.room_id = r.id WHERE mr.student_id = ? ORDER BY mr.created_at DESC`, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, maintenance: results });
  });
});

// Get student's applications
app.get('/api/admin/students/:id/applications', (req, res) => {
  const { id } = req.params;
  db.query(`SELECT a.*, r.room_number, r.building, r.room_type FROM applications a JOIN rooms r ON a.room_id = r.id WHERE a.student_id = ? ORDER BY a.application_date DESC`, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, applications: results });
  });
});

// ========== ROOM MANAGEMENT (ADMIN) ==========
app.post('/api/admin/rooms', (req, res) => {
  const { room_number, floor, building, room_type, capacity, description } = req.body;
  db.query(
    'INSERT INTO rooms (room_number, floor, building, room_type, capacity, description) VALUES (?, ?, ?, ?, ?, ?)',
    [room_number, floor, building, room_type, capacity, description],
    (err, result) => {
      if (err) {
        res.status(500).json({ success: false, message: err.message });
      } else {
        res.json({ success: true, message: 'Room created', roomId: result.insertId });
      }
    }
  );
});

app.put('/api/admin/rooms/:id', (req, res) => {
  const { id } = req.params;
  const { room_number, floor, building, room_type, capacity, room_status, description } = req.body;
  db.query(
    'UPDATE rooms SET room_number=?, floor=?, building=?, room_type=?, capacity=?, room_status=?, description=? WHERE id=?',
    [room_number, floor, building, room_type, capacity, room_status, description, id],
    (err) => {
      if (err) {
        res.status(500).json({ success: false, message: err.message });
      } else {
        res.json({ success: true, message: 'Room updated' });
      }
    }
  );
});

app.delete('/api/admin/rooms/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM rooms WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.json({ success: true, message: 'Room deleted' });
    }
  });
});

// Bulk Create Rooms
app.post('/api/admin/rooms/bulk', (req, res) => {
  const { blocks, floors_per_block, rooms_per_floor, capacity, room_type } = req.body;
  let rooms = [];
  let totalRooms = 0;
  const blockNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const blocksToUse = blocks === 'all' ? blockNames : blockNames.slice(0, parseInt(blocks));
  for (const block of blocksToUse) {
    for (let floor = 1; floor <= floors_per_block; floor++) {
      for (let roomNum = 1; roomNum <= rooms_per_floor; roomNum++) {
        const room_number = `${block}${floor}${roomNum.toString().padStart(3, '0')}`;
        rooms.push([room_number, floor, `Building ${block}`, room_type, capacity, 'available', `Room ${room_number} - Capacity ${capacity} students`]);
        totalRooms++;
      }
    }
  }
  if (rooms.length === 0) {
    return res.status(400).json({ success: false, message: 'No rooms to create' });
  }
  const query = 'INSERT INTO rooms (room_number, floor, building, room_type, capacity, room_status, description) VALUES ?';
  db.query(query, [rooms], (err, result) => {
    if (err) {
      console.error('Bulk insert error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: `${result.affectedRows} rooms created successfully!`, totalRooms: result.affectedRows });
  });
});

// ========== APPLICATIONS (ADMIN) ==========
app.get('/api/admin/applications', (req, res) => {
  const query = `
    SELECT a.*, s.first_name, s.last_name, s.student_id, r.room_number 
    FROM applications a
    JOIN students s ON a.student_id = s.id
    JOIN rooms r ON a.room_id = r.id
    ORDER BY a.application_date DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, applications: results });
  });
});

app.put('/api/admin/applications/:id/approve', (req, res) => {
  const { id } = req.params;
  db.query('SELECT student_id, room_id FROM applications WHERE id = ?', [id], (err, appResults) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (appResults.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });
    const { student_id, room_id } = appResults[0];
    db.query('SELECT s.email, s.first_name, r.room_number FROM students s JOIN rooms r ON r.id = ? WHERE s.id = ?', [room_id, student_id], async (err, studentData) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      db.query('UPDATE applications SET status = "approved", reviewed_date = NOW() WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        db.query('INSERT INTO room_assignments (student_id, room_id, assignment_date, status) VALUES (?, ?, CURDATE(), "active")', [student_id, room_id], (err) => {
          if (err) return res.status(500).json({ success: false, message: err.message });
          db.query('UPDATE rooms SET current_occupancy = current_occupancy + 1, room_status = CASE WHEN current_occupancy + 1 >= capacity THEN "full" ELSE "available" END WHERE id = ?', [room_id], async (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (studentData[0]?.email) {
              await sendApprovalEmail(studentData[0].email, studentData[0].first_name, studentData[0].room_number);
            }
            res.json({ success: true, message: 'Application approved and room assigned' });
          });
        });
      });
    });
  });
});

app.put('/api/admin/applications/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  db.query('SELECT s.email, s.first_name FROM applications a JOIN students s ON a.student_id = s.id WHERE a.id = ?', [id], async (err, studentData) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.query('UPDATE applications SET status = "rejected", reason = ?, reviewed_date = NOW() WHERE id = ?', [reason, id], async (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (studentData[0]?.email) {
        await sendRejectionEmail(studentData[0].email, studentData[0].first_name, reason);
      }
      res.json({ success: true, message: 'Application rejected' });
    });
  });
});

// ========== MAINTENANCE (ADMIN) ==========
app.get('/api/admin/maintenance', (req, res) => {
  const query = `
    SELECT mr.*, r.room_number, s.first_name, s.last_name 
    FROM maintenance_requests mr
    JOIN rooms r ON mr.room_id = r.id
    LEFT JOIN students s ON mr.student_id = s.id
    ORDER BY 
      CASE mr.priority 
        WHEN 'emergency' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        ELSE 4 
      END,
      mr.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, requests: results });
  });
});

app.put('/api/admin/maintenance/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  db.query('SELECT s.email, s.first_name, mr.title FROM maintenance_requests mr JOIN students s ON mr.student_id = s.id WHERE mr.id = ?', [id], async (err, studentData) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    let query = 'UPDATE maintenance_requests SET status = ?';
    let params = [status];
    if (status === 'completed') query += ', completion_date = NOW()';
    if (notes) { query += ', notes = ?'; params.push(notes); }
    query += ' WHERE id = ?';
    params.push(id);
    db.query(query, params, async (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (studentData[0]?.email) {
        await sendMaintenanceEmail(studentData[0].email, studentData[0].first_name, studentData[0].title, status);
      }
      res.json({ success: true, message: 'Status updated' });
    });
  });
});

// ========== STUDENT ROUTES ==========
app.post('/api/student/apply', (req, res) => {
  const { room_id, student_id } = req.body;
  if (!room_id || !student_id) {
    return res.status(400).json({ success: false, message: 'Room ID and Student ID are required' });
  }
  db.query('SELECT id FROM students WHERE id = ?', [student_id], (err, studentResults) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (studentResults.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    db.query('SELECT id FROM applications WHERE student_id = ? AND room_id = ? AND status != "rejected"', [student_id, room_id], (err, existing) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
      if (existing.length > 0) return res.status(400).json({ success: false, message: 'You have already applied for this room' });
      db.query('INSERT INTO applications (student_id, room_id, status) VALUES (?, ?, "pending")', [student_id, room_id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to submit application' });
        res.json({ success: true, message: 'Application submitted successfully' });
      });
    });
  });
});

app.get('/api/student/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query('SELECT * FROM students WHERE user_id = ?', [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (results.length === 0) return res.status(404).json({ success: false, message: 'Student profile not found' });
      res.json({ success: true, student: results[0] });
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.get('/api/student/applications', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query(`
      SELECT a.*, r.room_number, r.building, r.floor, r.room_type
      FROM applications a
      JOIN rooms r ON a.room_id = r.id
      JOIN students s ON a.student_id = s.id
      WHERE s.user_id = ?
      ORDER BY a.application_date DESC
    `, [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, applications: results });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/assignment/details', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query(`
      SELECT ra.*, r.room_number, r.floor, r.building, r.room_type, r.capacity, r.amenities, r.description
      FROM room_assignments ra
      JOIN rooms r ON ra.room_id = r.id
      JOIN students s ON ra.student_id = s.id
      WHERE s.user_id = ? AND ra.status = 'active'
    `, [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (results.length === 0) {
        return res.json({ success: true, assignment: null, message: 'No active room assignment' });
      }
      res.json({ success: true, assignment: results[0] });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/maintenance', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query(`
      SELECT mr.*, r.room_number 
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      JOIN students s ON mr.student_id = s.id
      WHERE s.user_id = ?
      ORDER BY mr.created_at DESC
    `, [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, requests: results });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.post('/api/student/maintenance', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { room_id, title, description, priority } = req.body;
    db.query('SELECT id FROM students WHERE user_id = ?', [decoded.id], (err, studentResults) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (studentResults.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      const student_id = studentResults[0].id;
      db.query('INSERT INTO maintenance_requests (room_id, student_id, title, description, priority, status) VALUES (?, ?, ?, ?, ?, "open")', [room_id, student_id, title, description, priority], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Maintenance request submitted', id: result.insertId });
      });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/payments', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query(`
      SELECT p.*, r.room_number 
      FROM payments p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN room_assignments ra ON p.room_assignment_id = ra.id
      LEFT JOIN rooms r ON ra.room_id = r.id
      WHERE s.user_id = ?
      ORDER BY p.due_date DESC
    `, [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, payments: results });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/profile/details', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query(`
      SELECT s.*, u.email 
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?
    `, [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (results.length === 0) return res.status(404).json({ success: false, message: 'Profile not found' });
      res.json({ success: true, profile: results[0] });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.put('/api/student/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { phone, address, city, major, year, parent_name, parent_phone } = req.body;
    db.query(`
      UPDATE students 
      SET phone = ?, address = ?, city = ?, major = ?, year = ?, parent_name = ?, parent_phone = ?
      WHERE user_id = ?
    `, [phone, address, city, major, year, parent_name, parent_phone, decoded.id], (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Profile updated successfully' });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/penalties', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query(`
      SELECT p.*, r.room_number
      FROM payments p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE s.user_id = ? AND p.penalty_type IS NOT NULL
      ORDER BY p.issued_date DESC
    `, [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, penalties: results });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

// ========== PAYMENTS (ADMIN) ==========
app.get('/api/admin/payments', (req, res) => {
  const query = `
    SELECT p.*, s.first_name, s.last_name, s.student_id, r.room_number
    FROM payments p
    JOIN students s ON p.student_id = s.id
    LEFT JOIN room_assignments ra ON p.room_assignment_id = ra.id
    LEFT JOIN rooms r ON ra.room_id = r.id
    ORDER BY p.due_date DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, payments: results });
  });
});

app.post('/api/admin/payments', (req, res) => {
  const { student_id, amount, due_date, payment_date, status, notes } = req.body;
  db.query(
    'INSERT INTO payments (student_id, amount, due_date, payment_date, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [student_id, amount, due_date, payment_date || null, status || 'pending', notes || null],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Payment record created', id: result.insertId });
    }
  );
});

app.put('/api/admin/payments/:id', (req, res) => {
  const { id } = req.params;
  const { status, payment_date, transaction_id } = req.body;
  db.query(
    'UPDATE payments SET status = ?, payment_date = ?, transaction_id = ? WHERE id = ?',
    [status, payment_date || new Date(), transaction_id || null, id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Payment updated' });
    }
  );
});

app.get('/api/admin/payments/summary', (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_collected,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
      SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as total_overdue,
      COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
    FROM payments
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, summary: results[0] });
  });
});

// ========== PENALTY SYSTEM (ADMIN) ==========
app.get('/api/admin/penalties', (req, res) => {
  const query = `
    SELECT p.*, s.first_name, s.last_name, s.student_id, s.room_id, r.room_number
    FROM payments p
    JOIN students s ON p.student_id = s.id
    LEFT JOIN rooms r ON s.room_id = r.id
    WHERE p.penalty_type IS NOT NULL
    ORDER BY p.issued_date DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, penalties: results });
  });
});

app.post('/api/admin/penalties', (req, res) => {
  const { student_id, penalty_amount, penalty_type, penalty_reason, due_date, notes } = req.body;
  db.query('SELECT s.email, s.first_name FROM students s WHERE s.id = ?', [student_id], async (err, studentData) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.query(
      `INSERT INTO payments 
       (student_id, penalty_amount, penalty_type, penalty_reason, due_date, status, issued_date, notes) 
       VALUES (?, ?, ?, ?, ?, 'pending', CURDATE(), ?)`,
      [student_id, penalty_amount, penalty_type, penalty_reason, due_date, notes],
      async (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (studentData[0]?.email) {
          await sendPenaltyEmail(studentData[0].email, studentData[0].first_name, penalty_amount, penalty_reason);
        }
        res.json({ success: true, message: 'Penalty issued', id: result.insertId });
      }
    );
  });
});

app.put('/api/admin/penalties/:id', (req, res) => {
  const { id } = req.params;
  const { status, payment_date } = req.body;
  db.query('UPDATE payments SET status = ?, payment_date = ? WHERE id = ?', [status, payment_date || new Date(), id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Penalty updated' });
  });
});

// ========== REPORTS ==========
app.get('/api/admin/reports/occupancy', (req, res) => {
  db.query(`
    SELECT 
      room_number, building, floor, room_type, capacity, current_occupancy,
      ROUND((current_occupancy / capacity) * 100, 2) as occupancy_percentage,
      room_status
    FROM rooms
    ORDER BY building ASC, floor ASC, room_number ASC
  `, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, report: results });
  });
});

app.get('/api/admin/reports/payments', (req, res) => {
  db.query(`
    SELECT 
      s.student_id, s.first_name, s.last_name, s.email,
      SUM(CASE WHEN p.status = 'paid' THEN p.penalty_amount ELSE 0 END) as amount_paid,
      SUM(CASE WHEN p.status = 'pending' THEN p.penalty_amount ELSE 0 END) as amount_pending,
      SUM(CASE WHEN p.status = 'overdue' THEN p.penalty_amount ELSE 0 END) as amount_overdue
    FROM students s
    LEFT JOIN payments p ON s.id = p.student_id
    GROUP BY s.id
    ORDER BY s.last_name ASC
  `, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, report: results });
  });
});

app.get('/api/admin/reports/maintenance', (req, res) => {
  db.query(`
    SELECT 
      mr.*, r.room_number, s.first_name, s.last_name, s.student_id
    FROM maintenance_requests mr
    JOIN rooms r ON mr.room_id = r.id
    LEFT JOIN students s ON mr.student_id = s.id
    ORDER BY 
      CASE mr.priority 
        WHEN 'emergency' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        ELSE 4 
      END,
      mr.created_at DESC
  `, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, report: results });
  });
});

app.get('/api/admin/reports/assignments', (req, res) => {
  const query = `
    SELECT 
      ra.id, ra.assignment_date, ra.status as assignment_status,
      s.id as student_id, s.student_id as student_number, s.first_name, s.last_name, s.email, s.phone, s.major, s.year,
      r.id as room_id, r.room_number, r.building, r.floor, r.room_type, r.capacity
    FROM room_assignments ra
    JOIN students s ON ra.student_id = s.id
    JOIN rooms r ON ra.room_id = r.id
    WHERE ra.status = 'active'
    ORDER BY r.building ASC, r.floor ASC, r.room_number ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, assignments: results });
  });
});

// ========== PROFILE PHOTO UPLOADS ==========
const studentStorage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const studentUpload = multer({ 
  storage: studentStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images are allowed'));
  }
});

app.post('/api/student/upload-photo', verifyToken, studentUpload.single('profile_image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    db.query('UPDATE students SET profile_image = ? WHERE id = ?', [imageUrl, results[0].id], (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Photo uploaded successfully', imageUrl });
    });
  });
});

const adminStorage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'admin-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const adminUpload = multer({ 
  storage: adminStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images allowed'));
  }
});

app.post('/api/admin/upload-photo', verifyToken, adminUpload.single('profile_image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  db.query('UPDATE admins SET profile_image = ? WHERE user_id = ?', [imageUrl, req.user.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Photo uploaded', imageUrl });
  });
});

// ========== ADMIN PROFILE ROUTES ==========
app.get('/api/admin/profile/details', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query(`SELECT a.*, u.email FROM admins a JOIN users u ON a.user_id = u.id WHERE a.user_id = ?`, [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (results.length === 0) return res.status(404).json({ success: false, message: 'Admin not found' });
      res.json({ success: true, profile: results[0] });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.put('/api/admin/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { phone, position, department, address } = req.body;
    db.query(`UPDATE admins SET phone = ?, position = ?, department = ?, address = ? WHERE user_id = ?`, [phone, position, department, address, decoded.id], (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Profile updated' });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.put('/api/admin/change-password', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ success: false, message: 'Current password and new password required' });
    if (new_password.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    db.query('SELECT * FROM users WHERE id = ?', [decoded.id], async (err, users) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
      const user = users[0];
      const passwordMatch = await bcrypt.compare(current_password, user.password);
      if (!passwordMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      const hashedPassword = await bcrypt.hash(new_password, 10);
      db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Password changed successfully' });
      });
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});
// ========== FORGOT PASSWORD ==========

// Generate random token for password reset
const crypto = require('crypto');

// Request password reset - sends email with reset link
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  
  // Check if user exists
  db.query('SELECT id, email, role FROM users WHERE email = ?', [email], async (err, users) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (users.length === 0) {
      // For security, don't reveal that email doesn't exist
      return res.json({ success: true, message: 'If your email is registered, you will receive a reset link' });
    }
    
    const user = users[0];
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Save token to database (you need to add reset_token column to users table)
    db.query('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', 
      [resetToken, resetExpires, user.id], 
      async (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        // Send reset email
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        const subject = '🔐 Password Reset Request';
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #5B5CE2;">🏛️ University Dormitory</h2>
            <h3>Password Reset Request</h3>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #5B5CE2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in <strong>1 hour</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6B7280; font-size: 12px;">University Dormitory Management System</p>
          </div>
        `;
        
        await sendEmail(email, subject, html);
        res.json({ success: true, message: 'If your email is registered, you will receive a reset link' });
      }
    );
  });
});

// Verify reset token
app.post('/api/auth/verify-reset-token', (req, res) => {
  const { token } = req.body;
  
  db.query('SELECT id, email FROM users WHERE reset_token = ? AND reset_expires > NOW()', [token], (err, users) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    
    res.json({ success: true, message: 'Token is valid', email: users[0].email });
  });
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, new_password } = req.body;
  
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  
  db.query('SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()', [token], async (err, users) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    
    const userId = users[0].id;
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    db.query('UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?', 
      [hashedPassword, userId], 
      (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Password reset successfully. You can now login with your new password.' });
      }
    );
  });
});
// ========== ROOM SWAP SYSTEM ==========

// Get all students (for dropdown)
app.get('/api/students/all', (req, res) => {
  db.query('SELECT id, student_id, first_name, last_name, room_id FROM students WHERE status = "active"', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, students: results });
  });
});

// Create a swap request
app.post('/api/student/swap-request', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { target_student_id, reason } = req.body;
    
    // Get requester student info
    db.query('SELECT id, room_id FROM students WHERE user_id = ?', [decoded.id], (err, requester) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (requester.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      
      const requester_student_id = requester[0].id;
      const requester_room_id = requester[0].room_id;
      
      if (!requester_room_id) {
        return res.status(400).json({ success: false, message: 'You are not assigned to any room' });
      }
      
      // Get target student room
      db.query('SELECT id, room_id FROM students WHERE id = ?', [target_student_id], (err, target) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (target.length === 0) return res.status(404).json({ success: false, message: 'Target student not found' });
        
        const target_student_id_val = target[0].id;
        const target_room_id = target[0].room_id;
        
        if (!target_room_id) {
          return res.status(400).json({ success: false, message: 'Target student has no room assignment' });
        }
        
        // Check if swap request already exists
        db.query('SELECT id FROM room_swap_requests WHERE (requester_student_id = ? AND target_student_id = ?) AND status = "pending"', 
          [requester_student_id, target_student_id_val], 
          (err, existing) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (existing.length > 0) {
              return res.status(400).json({ success: false, message: 'You already have a pending swap request with this student' });
            }
            
            // Create swap request
            db.query(
              `INSERT INTO room_swap_requests 
               (requester_student_id, requester_room_id, target_student_id, target_room_id, reason) 
               VALUES (?, ?, ?, ?, ?)`,
              [requester_student_id, requester_room_id, target_student_id_val, target_room_id, reason || null],
              (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.json({ success: true, message: 'Swap request sent successfully', id: result.insertId });
              }
            );
          }
        );
      });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

// Get my swap requests (as requester)
app.get('/api/student/my-swap-requests', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    db.query('SELECT id FROM students WHERE user_id = ?', [decoded.id], (err, student) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      
      db.query(`
        SELECT rs.*, 
               s1.first_name as requester_first, s1.last_name as requester_last, s1.student_id as requester_number,
               s2.first_name as target_first, s2.last_name as target_last, s2.student_id as target_number,
               r1.room_number as requester_room, r2.room_number as target_room
        FROM room_swap_requests rs
        JOIN students s1 ON rs.requester_student_id = s1.id
        JOIN students s2 ON rs.target_student_id = s2.id
        JOIN rooms r1 ON rs.requester_room_id = r1.id
        JOIN rooms r2 ON rs.target_room_id = r2.id
        WHERE rs.requester_student_id = ? OR rs.target_student_id = ?
        ORDER BY rs.created_at DESC
      `, [student[0].id, student[0].id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, requests: results });
      });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

// Respond to swap request (accept/reject)
app.put('/api/student/swap-request/:id/respond', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  const { id } = req.params;
  const { action } = req.body; // 'accept' or 'reject'
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    db.query('SELECT id FROM students WHERE user_id = ?', [decoded.id], (err, student) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      
      if (action === 'accept') {
        // Get swap request details
        db.query('SELECT * FROM room_swap_requests WHERE id = ? AND target_student_id = ? AND status = "pending"', 
          [id, student[0].id], 
          (err, swap) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (swap.length === 0) return res.status(404).json({ success: false, message: 'Swap request not found' });
            
            const requester_id = swap[0].requester_student_id;
            const requester_room = swap[0].requester_room_id;
            const target_room = swap[0].target_room_id;
            
            // Swap rooms in room_assignments
            db.query('UPDATE room_assignments SET room_id = ? WHERE student_id = ? AND status = "active"', 
              [target_room, requester_id], (err) => {
              if (err) return res.status(500).json({ success: false, message: err.message });
              
              db.query('UPDATE room_assignments SET room_id = ? WHERE student_id = ? AND status = "active"', 
                [requester_room, student[0].id], (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                
                // Update students table room_id
                db.query('UPDATE students SET room_id = ? WHERE id = ?', [target_room, requester_id], (err) => {
                  if (err) return res.status(500).json({ success: false, message: err.message });
                  
                  db.query('UPDATE students SET room_id = ? WHERE id = ?', [requester_room, student[0].id], (err) => {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    
                    // Update swap request status
                    db.query('UPDATE room_swap_requests SET status = "approved" WHERE id = ?', [id], (err) => {
                      if (err) return res.status(500).json({ success: false, message: err.message });
                      res.json({ success: true, message: 'Room swap completed successfully!' });
                    });
                  });
                });
              });
            });
          });
      } else {
        // Reject
        db.query('UPDATE room_swap_requests SET status = "rejected" WHERE id = ? AND target_student_id = ?', 
          [id, student[0].id], 
          (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: 'Swap request rejected' });
          });
      }
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

// Admin - Get all swap requests
app.get('/api/admin/swap-requests', (req, res) => {
  db.query(`
    SELECT rs.*, 
           s1.first_name as requester_first, s1.last_name as requester_last, s1.student_id as requester_number,
           s2.first_name as target_first, s2.last_name as target_last, s2.student_id as target_number,
           r1.room_number as requester_room, r2.room_number as target_room
    FROM room_swap_requests rs
    JOIN students s1 ON rs.requester_student_id = s1.id
    JOIN students s2 ON rs.target_student_id = s2.id
    JOIN rooms r1 ON rs.requester_room_id = r1.id
    JOIN rooms r2 ON rs.target_room_id = r2.id
    ORDER BY rs.created_at DESC
  `, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, requests: results });
  });
});

// Admin - Approve swap request
app.put('/api/admin/swap-requests/:id/approve', (req, res) => {
  const { id } = req.params;
  
  db.query('SELECT * FROM room_swap_requests WHERE id = ? AND status = "pending"', [id], (err, swap) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (swap.length === 0) return res.status(404).json({ success: false, message: 'Swap request not found' });
    
    const requester_id = swap[0].requester_student_id;
    const requester_room = swap[0].requester_room_id;
    const target_id = swap[0].target_student_id;
    const target_room = swap[0].target_room_id;
    
    // Swap rooms
    db.query('UPDATE room_assignments SET room_id = ? WHERE student_id = ? AND status = "active"', [target_room, requester_id], (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      
      db.query('UPDATE room_assignments SET room_id = ? WHERE student_id = ? AND status = "active"', [requester_room, target_id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        db.query('UPDATE students SET room_id = ? WHERE id = ?', [target_room, requester_id], (err) => {
          if (err) return res.status(500).json({ success: false, message: err.message });
          
          db.query('UPDATE students SET room_id = ? WHERE id = ?', [requester_room, target_id], (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            
            db.query('UPDATE room_swap_requests SET status = "approved" WHERE id = ?', [id], (err) => {
              if (err) return res.status(500).json({ success: false, message: err.message });
              res.json({ success: true, message: 'Swap request approved and rooms swapped' });
            });
          });
        });
      });
    });
  });
});
// ========== ATTENDANCE SYSTEM ==========

// Get all students for attendance
app.get('/api/admin/attendance/students', (req, res) => {
  db.query('SELECT id, student_id, first_name, last_name FROM students WHERE status = "active"', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, students: results });
  });
});

// Get attendance for a specific date
app.get('/api/admin/attendance', (req, res) => {
  const { date } = req.query;
  const attendanceDate = date || new Date().toISOString().split('T')[0];
  
  db.query(`
    SELECT s.id, s.student_id, s.first_name, s.last_name, 
           a.status, a.check_in_time, a.check_out_time, a.notes, a.id as attendance_id
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
    WHERE s.status = 'active'
    ORDER BY s.first_name ASC
  `, [attendanceDate], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, attendance: results, date: attendanceDate });
  });
});

// Mark attendance
app.post('/api/admin/attendance/mark', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { student_id, date, status, check_in_time, check_out_time, notes } = req.body;
    
    // Get admin id
    db.query('SELECT id FROM admins WHERE user_id = ?', [decoded.id], (err, adminResult) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      
      const marked_by = adminResult[0]?.id || null;
      
      db.query(
        `INSERT INTO attendance (student_id, date, status, check_in_time, check_out_time, notes, marked_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         status = VALUES(status), 
         check_in_time = VALUES(check_in_time), 
         check_out_time = VALUES(check_out_time), 
         notes = VALUES(notes), 
         marked_by = VALUES(marked_by)`,
        [student_id, date, status, check_in_time || null, check_out_time || null, notes || null, marked_by],
        (err) => {
          if (err) return res.status(500).json({ success: false, message: err.message });
          res.json({ success: true, message: 'Attendance marked successfully' });
        }
      );
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

// Get attendance summary (statistics)
app.get('/api/admin/attendance/summary', (req, res) => {
  const { month, year } = req.query;
  const currentDate = new Date();
  const targetMonth = month || currentDate.getMonth() + 1;
  const targetYear = year || currentDate.getFullYear();
  
  db.query(`
    SELECT 
      s.id, s.student_id, s.first_name, s.last_name,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
      COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
      COUNT(CASE WHEN a.status = 'excused' THEN 1 END) as excused_days,
      COUNT(a.id) as total_days
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id AND MONTH(a.date) = ? AND YEAR(a.date) = ?
    WHERE s.status = 'active'
    GROUP BY s.id
    ORDER BY s.first_name ASC
  `, [targetMonth, targetYear], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, summary: results, month: targetMonth, year: targetYear });
  });
});

// Get student's own attendance
app.get('/api/student/my-attendance', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    db.query(`
      SELECT a.*, DATE_FORMAT(a.date, '%Y-%m-%d') as attendance_date
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE s.user_id = ?
      ORDER BY a.date DESC
      LIMIT 30
    `, [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      
      // Calculate statistics
      const present = results.filter(r => r.status === 'present').length;
      const absent = results.filter(r => r.status === 'absent').length;
      const late = results.filter(r => r.status === 'late').length;
      const total = results.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      res.json({ 
        success: true, 
        attendance: results,
        stats: { present, absent, late, total, percentage }
      });
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});
// ========== BULK STUDENT IMPORT ==========
const XLSX = require('xlsx');

// Upload and process Excel/CSV file
const uploadExcel = multer({ storage: multer.memoryStorage() });

app.post('/api/admin/students/bulk-import', uploadExcel.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const row of data) {
      try {
        // Check required fields
        if (!row.email || !row.password || !row.firstName || !row.lastName || !row.studentId) {
          errors.push(`Missing required fields for row: ${JSON.stringify(row)}`);
          errorCount++;
          continue;
        }
        
        // Check if user exists
        const [existing] = await db.promise().query('SELECT id FROM users WHERE email = ?', [row.email]);
        if (existing.length > 0) {
          errors.push(`Email ${row.email} already exists`);
          errorCount++;
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(row.password, 10);
        
        // Create user
        const [userResult] = await db.promise().query(
          'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
          [row.email, hashedPassword, 'student']
        );
        
        // Create student
        await db.promise().query(
          `INSERT INTO students (user_id, student_id, first_name, last_name, email, phone, major, year, gender, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
          [userResult.insertId, row.studentId, row.firstName, row.lastName, row.email, row.phone || null, row.major || null, row.year || null, row.gender || null]
        );
        
        successCount++;
      } catch (error) {
        errors.push(`Error importing ${row.email}: ${error.message}`);
        errorCount++;
      }
    }
    
    res.json({
      success: true,
      message: `Import completed: ${successCount} students added, ${errorCount} failed`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10) // Return first 10 errors
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, message: 'Failed to process file' });
  }
});

// Download sample template
app.get('/api/admin/students/template', (req, res) => {
  const template = [
    { email: 'student1@university.edu', password: 'password123', firstName: 'John', lastName: 'Doe', studentId: 'STU001', phone: '555-0101', major: 'Computer Science', year: '1', gender: 'male' },
    { email: 'student2@university.edu', password: 'password123', firstName: 'Jane', lastName: 'Smith', studentId: 'STU002', phone: '555-0102', major: 'Engineering', year: '2', gender: 'female' }
  ];
  
  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=student_template.xlsx');
  res.send(buffer);
});

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});