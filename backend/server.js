const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const XLSX = require('xlsx');
require('dotenv').config();

// Database connection - PostgreSQL
const pool = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('✓ Database connected successfully');
    release();
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
app.get('/api/rooms', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, room_number, floor, building, room_type, capacity, current_occupancy, room_status, amenities, description, image_url, created_at, updated_at FROM rooms');
    res.json({ success: true, count: result.rows.length, rooms: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== AUTH ROUTES ==========
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email);
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const users = result.rows;
    
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Student Registration
app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName, studentId, phone, major, year, gender } = req.body;
  console.log('Registration attempt:', email);
  
  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'student']
    );
    
    await pool.query(
      `INSERT INTO students (user_id, student_id, first_name, last_name, email, phone, major, year, gender, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')`,
      [userResult.rows[0].id, studentId, firstName, lastName, email, phone || null, major || null, year || null, gender || null]
    );
    
    const token = jwt.sign(
      { id: userResult.rows[0].id, email: email, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('Registration successful:', email);
    res.json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: userResult.rows[0].id, email: email, role: 'student', firstName, lastName }
    });
  } catch (error) {
    console.log('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========== ADMIN ROUTES ==========

// Admin Dashboard Statistics
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const totalStudents = await pool.query('SELECT COUNT(*) as count FROM students');
    const totalRooms = await pool.query('SELECT COUNT(*) as count FROM rooms');
    const availableRooms = await pool.query("SELECT COUNT(*) as count FROM rooms WHERE room_status = 'available'");
    const pendingApplications = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'");
    const openMaintenance = await pool.query("SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'open'");
    
    res.json({
      success: true,
      statistics: {
        totalStudents: parseInt(totalStudents.rows[0].count),
        totalRooms: parseInt(totalRooms.rows[0].count),
        availableRooms: parseInt(availableRooms.rows[0].count),
        pendingApplications: parseInt(pendingApplications.rows[0].count),
        openMaintenance: parseInt(openMaintenance.rows[0].count)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all students
app.get('/api/admin/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students');
    res.json({ success: true, count: result.rows.length, students: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete student
app.delete('/api/admin/students/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    const studentResult = await pool.query('SELECT user_id FROM students WHERE id = $1', [id]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const user_id = studentResult.rows[0].user_id;
    await pool.query('DELETE FROM students WHERE id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [user_id]);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
    const studentResult = await pool.query('SELECT user_id FROM students WHERE id = $1', [id]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const user_id = studentResult.rows[0].user_id;
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user_id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single student details
app.get('/api/admin/students/:id/details', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT s.*, u.email, 
             r.room_number, r.building, r.floor, r.room_type,
             ra.assignment_date, ra.status as assignment_status
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN room_assignments ra ON s.id = ra.student_id AND ra.status = 'active'
      LEFT JOIN rooms r ON ra.room_id = r.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, student: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get student's payment history
app.get('/api/admin/students/:id/payments', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM payments WHERE student_id = $1 ORDER BY due_date DESC', [id]);
    res.json({ success: true, payments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get student's maintenance requests
app.get('/api/admin/students/:id/maintenance', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT mr.*, r.room_number FROM maintenance_requests mr 
       JOIN rooms r ON mr.room_id = r.id 
       WHERE mr.student_id = $1 
       ORDER BY mr.created_at DESC`,
      [id]
    );
    res.json({ success: true, maintenance: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get student's applications
app.get('/api/admin/students/:id/applications', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.*, r.room_number, r.building, r.room_type 
       FROM applications a 
       JOIN rooms r ON a.room_id = r.id 
       WHERE a.student_id = $1 
       ORDER BY a.application_date DESC`,
      [id]
    );
    res.json({ success: true, applications: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== ROOM MANAGEMENT (ADMIN) ==========
app.post('/api/admin/rooms', async (req, res) => {
  const { room_number, floor, building, room_type, capacity, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO rooms (room_number, floor, building, room_type, capacity, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [room_number, floor, building, room_type, capacity, description]
    );
    res.json({ success: true, message: 'Room created', roomId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/rooms/:id', async (req, res) => {
  const { id } = req.params;
  const { room_number, floor, building, room_type, capacity, room_status, description } = req.body;
  try {
    await pool.query(
      'UPDATE rooms SET room_number=$1, floor=$2, building=$3, room_type=$4, capacity=$5, room_status=$6, description=$7 WHERE id=$8',
      [room_number, floor, building, room_type, capacity, room_status, description, id]
    );
    res.json({ success: true, message: 'Room updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk Create Rooms
app.post('/api/admin/rooms/bulk', async (req, res) => {
  const { blocks, floors_per_block, rooms_per_floor, capacity, room_type } = req.body;
  const blockNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const blocksToUse = blocks === 'all' ? blockNames : blockNames.slice(0, parseInt(blocks));
  let created = 0;
  
  try {
    for (const block of blocksToUse) {
      for (let floor = 1; floor <= floors_per_block; floor++) {
        for (let roomNum = 1; roomNum <= rooms_per_floor; roomNum++) {
          const room_number = `${block}${floor}${roomNum.toString().padStart(3, '0')}`;
          await pool.query(
            'INSERT INTO rooms (room_number, floor, building, room_type, capacity, room_status, description) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [room_number, floor, `Building ${block}`, room_type, capacity, 'available', `Room ${room_number} - Capacity ${capacity} students`]
          );
          created++;
        }
      }
    }
    res.json({ success: true, message: `${created} rooms created successfully!`, totalRooms: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== APPLICATIONS (ADMIN) ==========
app.get('/api/admin/applications', async (req, res) => {
  try {
    const query = `
      SELECT a.*, s.first_name, s.last_name, s.student_id, r.room_number 
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN rooms r ON a.room_id = r.id
      ORDER BY a.application_date DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, applications: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/applications/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const appResult = await pool.query('SELECT student_id, room_id FROM applications WHERE id = $1', [id]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    const { student_id, room_id } = appResult.rows[0];
    
    const studentData = await pool.query('SELECT s.email, s.first_name, r.room_number FROM students s JOIN rooms r ON r.id = $1 WHERE s.id = $2', [room_id, student_id]);
    
    await pool.query('UPDATE applications SET status = $1, reviewed_date = NOW() WHERE id = $2', ['approved', id]);
    await pool.query('INSERT INTO room_assignments (student_id, room_id, assignment_date, status) VALUES ($1, $2, CURDATE(), $3)', [student_id, room_id, 'active']);
    await pool.query('UPDATE rooms SET current_occupancy = current_occupancy + 1, room_status = CASE WHEN current_occupancy + 1 >= capacity THEN $1 ELSE $2 END WHERE id = $3', ['full', 'available', room_id]);
    
    if (studentData.rows[0]?.email) {
      await sendApprovalEmail(studentData.rows[0].email, studentData.rows[0].first_name, studentData.rows[0].room_number);
    }
    res.json({ success: true, message: 'Application approved and room assigned' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/applications/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const studentData = await pool.query('SELECT s.email, s.first_name FROM applications a JOIN students s ON a.student_id = s.id WHERE a.id = $1', [id]);
    await pool.query('UPDATE applications SET status = $1, reason = $2, reviewed_date = NOW() WHERE id = $3', ['rejected', reason, id]);
    if (studentData.rows[0]?.email) {
      await sendRejectionEmail(studentData.rows[0].email, studentData.rows[0].first_name, reason);
    }
    res.json({ success: true, message: 'Application rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== MAINTENANCE (ADMIN) ==========
app.get('/api/admin/maintenance', async (req, res) => {
  try {
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
    const result = await pool.query(query);
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/maintenance/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  try {
    const studentData = await pool.query('SELECT s.email, s.first_name, mr.title FROM maintenance_requests mr JOIN students s ON mr.student_id = s.id WHERE mr.id = $1', [id]);
    
    let query = 'UPDATE maintenance_requests SET status = $1';
    let params = [status];
    if (status === 'completed') {
      query += ', completion_date = NOW()';
    }
    if (notes) {
      query += ', notes = $' + (params.length + 1);
      params.push(notes);
    }
    query += ' WHERE id = $' + (params.length + 1);
    params.push(id);
    
    await pool.query(query, params);
    if (studentData.rows[0]?.email) {
      await sendMaintenanceEmail(studentData.rows[0].email, studentData.rows[0].first_name, studentData.rows[0].title, status);
    }
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== STUDENT ROUTES ==========
app.post('/api/student/apply', async (req, res) => {
  const { room_id, student_id } = req.body;
  if (!room_id || !student_id) {
    return res.status(400).json({ success: false, message: 'Room ID and Student ID are required' });
  }
  try {
    const studentResult = await pool.query('SELECT id FROM students WHERE id = $1', [student_id]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const existing = await pool.query('SELECT id FROM applications WHERE student_id = $1 AND room_id = $2 AND status != $3', [student_id, room_id, 'rejected']);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already applied for this room' });
    }
    await pool.query('INSERT INTO applications (student_id, room_id, status) VALUES ($1, $2, $3)', [student_id, room_id, 'pending']);
    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/student/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT * FROM students WHERE user_id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.json({ success: true, student: result.rows[0] });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.get('/api/student/applications', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`
      SELECT a.*, r.room_number, r.building, r.floor, r.room_type
      FROM applications a
      JOIN rooms r ON a.room_id = r.id
      JOIN students s ON a.student_id = s.id
      WHERE s.user_id = $1
      ORDER BY a.application_date DESC
    `, [decoded.id]);
    res.json({ success: true, applications: result.rows });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/assignment/details', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`
      SELECT ra.*, r.room_number, r.floor, r.building, r.room_type, r.capacity, r.amenities, r.description
      FROM room_assignments ra
      JOIN rooms r ON ra.room_id = r.id
      JOIN students s ON ra.student_id = s.id
      WHERE s.user_id = $1 AND ra.status = 'active'
    `, [decoded.id]);
    if (result.rows.length === 0) {
      return res.json({ success: true, assignment: null, message: 'No active room assignment' });
    }
    res.json({ success: true, assignment: result.rows[0] });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/maintenance', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`
      SELECT mr.*, r.room_number 
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      JOIN students s ON mr.student_id = s.id
      WHERE s.user_id = $1
      ORDER BY mr.created_at DESC
    `, [decoded.id]);
    res.json({ success: true, requests: result.rows });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.post('/api/student/maintenance', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { room_id, title, description, priority } = req.body;
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [decoded.id]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const student_id = studentResult.rows[0].id;
    const result = await pool.query(
      'INSERT INTO maintenance_requests (room_id, student_id, title, description, priority, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [room_id, student_id, title, description, priority, 'open']
    );
    res.json({ success: true, message: 'Maintenance request submitted', id: result.rows[0].id });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/payments', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`
      SELECT p.*, r.room_number 
      FROM payments p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN room_assignments ra ON p.room_assignment_id = ra.id
      LEFT JOIN rooms r ON ra.room_id = r.id
      WHERE s.user_id = $1
      ORDER BY p.due_date DESC
    `, [decoded.id]);
    res.json({ success: true, payments: result.rows });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/profile/details', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`
      SELECT s.*, u.email 
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1
    `, [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.put('/api/student/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { phone, address, city, major, year, parent_name, parent_phone } = req.body;
    await pool.query(`
      UPDATE students 
      SET phone = $1, address = $2, city = $3, major = $4, year = $5, parent_name = $6, parent_phone = $7
      WHERE user_id = $8
    `, [phone, address, city, major, year, parent_name, parent_phone, decoded.id]);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/penalties', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`
      SELECT p.*, r.room_number
      FROM payments p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE s.user_id = $1 AND p.penalty_type IS NOT NULL
      ORDER BY p.issued_date DESC
    `, [decoded.id]);
    res.json({ success: true, penalties: result.rows });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

// ========== PAYMENTS (ADMIN) ==========
app.get('/api/admin/payments', async (req, res) => {
  try {
    const query = `
      SELECT p.*, s.first_name, s.last_name, s.student_id, r.room_number
      FROM payments p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN room_assignments ra ON p.room_assignment_id = ra.id
      LEFT JOIN rooms r ON ra.room_id = r.id
      ORDER BY p.due_date DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, payments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/payments', async (req, res) => {
  const { student_id, amount, due_date, payment_date, status, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO payments (student_id, amount, due_date, payment_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [student_id, amount, due_date, payment_date || null, status || 'pending', notes || null]
    );
    res.json({ success: true, message: 'Payment record created', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/payments/:id', async (req, res) => {
  const { id } = req.params;
  const { status, payment_date, transaction_id } = req.body;
  try {
    await pool.query(
      'UPDATE payments SET status = $1, payment_date = $2, transaction_id = $3 WHERE id = $4',
      [status, payment_date || new Date(), transaction_id || null, id]
    );
    res.json({ success: true, message: 'Payment updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/payments/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_collected,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as total_overdue,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
      FROM payments
    `);
    res.json({ success: true, summary: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== PENALTY SYSTEM (ADMIN) ==========
app.get('/api/admin/penalties', async (req, res) => {
  try {
    const query = `
      SELECT p.*, s.first_name, s.last_name, s.student_id, s.room_id, r.room_number
      FROM payments p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE p.penalty_type IS NOT NULL
      ORDER BY p.issued_date DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, penalties: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/penalties', async (req, res) => {
  const { student_id, penalty_amount, penalty_type, penalty_reason, due_date, notes } = req.body;
  try {
    const studentData = await pool.query('SELECT s.email, s.first_name FROM students s WHERE s.id = $1', [student_id]);
    const result = await pool.query(
      `INSERT INTO payments 
       (student_id, penalty_amount, penalty_type, penalty_reason, due_date, status, issued_date, notes) 
       VALUES ($1, $2, $3, $4, $5, 'pending', CURDATE(), $6) RETURNING id`,
      [student_id, penalty_amount, penalty_type, penalty_reason, due_date, notes]
    );
    if (studentData.rows[0]?.email) {
      await sendPenaltyEmail(studentData.rows[0].email, studentData.rows[0].first_name, penalty_amount, penalty_reason);
    }
    res.json({ success: true, message: 'Penalty issued', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/penalties/:id', async (req, res) => {
  const { id } = req.params;
  const { status, payment_date } = req.body;
  try {
    await pool.query('UPDATE payments SET status = $1, payment_date = $2 WHERE id = $3', [status, payment_date || new Date(), id]);
    res.json({ success: true, message: 'Penalty updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== REPORTS ==========
app.get('/api/admin/reports/occupancy', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        room_number, building, floor, room_type, capacity, current_occupancy,
        ROUND((current_occupancy::numeric / capacity) * 100, 2) as occupancy_percentage,
        room_status
      FROM rooms
      ORDER BY building ASC, floor ASC, room_number ASC
    `);
    res.json({ success: true, report: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/reports/payments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.student_id, s.first_name, s.last_name, s.email,
        SUM(CASE WHEN p.status = 'paid' THEN p.penalty_amount ELSE 0 END) as amount_paid,
        SUM(CASE WHEN p.status = 'pending' THEN p.penalty_amount ELSE 0 END) as amount_pending,
        SUM(CASE WHEN p.status = 'overdue' THEN p.penalty_amount ELSE 0 END) as amount_overdue
      FROM students s
      LEFT JOIN payments p ON s.id = p.student_id
      GROUP BY s.id, s.student_id, s.first_name, s.last_name, s.email
      ORDER BY s.last_name ASC
    `);
    res.json({ success: true, report: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/reports/maintenance', async (req, res) => {
  try {
    const result = await pool.query(`
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
    `);
    res.json({ success: true, report: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Get admin profile details
app.get('/api/admin/profile/details', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`
      SELECT a.*, u.email 
      FROM admins a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.user_id = $1
    `, [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Admin profile error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.get('/api/admin/reports/assignments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ra.id, ra.assignment_date, ra.status as assignment_status,
        s.id as student_id, s.student_id as student_number, s.first_name, s.last_name, s.email, s.phone, s.major, s.year,
        r.id as room_id, r.room_number, r.building, r.floor, r.room_type, r.capacity
      FROM room_assignments ra
      JOIN students s ON ra.student_id = s.id
      JOIN rooms r ON ra.room_id = r.id
      WHERE ra.status = 'active'
      ORDER BY r.building ASC, r.floor ASC, r.room_number ASC
    `);
    res.json({ success: true, assignments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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

app.post('/api/student/upload-photo', verifyToken, studentUpload.single('profile_image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  try {
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    await pool.query('UPDATE students SET profile_image = $1 WHERE id = $2', [imageUrl, studentResult.rows[0].id]);
    res.json({ success: true, message: 'Photo uploaded successfully', imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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

app.post('/api/admin/upload-photo', verifyToken, adminUpload.single('profile_image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  try {
    await pool.query('UPDATE admins SET profile_image = $1 WHERE user_id = $2', [imageUrl, req.user.id]);
    res.json({ success: true, message: 'Photo uploaded', imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== ADMIN PROFILE ROUTES ==========
app.get('/api/admin/profile/details', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`SELECT a.*, u.email FROM admins a JOIN users u ON a.user_id = u.id WHERE a.user_id = $1`, [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.put('/api/admin/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { phone, position, department, address } = req.body;
    await pool.query(`UPDATE admins SET phone = $1, position = $2, department = $3, address = $4 WHERE user_id = $5`, [phone, position, department, address, decoded.id]);
    res.json({ success: true, message: 'Profile updated' });
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
    
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(current_password, user.password);
    if (!passwordMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, decoded.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// ========== FORGOT PASSWORD ==========
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  try {
    const userResult = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.json({ success: true, message: 'If your email is registered, you will receive a reset link' });
    }
    const user = userResult.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);
    await pool.query('UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3', [resetToken, resetExpires, user.id]);
    
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/verify-reset-token', async (req, res) => {
  const { token } = req.body;
  try {
    const result = await pool.query('SELECT id, email FROM users WHERE reset_token = $1 AND reset_expires > NOW()', [token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    res.json({ success: true, message: 'Token is valid', email: result.rows[0].email });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, new_password } = req.body;
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  try {
    const userResult = await pool.query('SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()', [token]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    const userId = userResult.rows[0].id;
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2', [hashedPassword, userId]);
    res.json({ success: true, message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========== ROOM SWAP SYSTEM ==========
app.get('/api/students/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, student_id, first_name, last_name, room_id FROM students WHERE status = $1', ['active']);
    res.json({ success: true, students: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/student/swap-request', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { target_student_id, reason } = req.body;
    
    const requesterResult = await pool.query('SELECT id, room_id FROM students WHERE user_id = $1', [decoded.id]);
    if (requesterResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const requester_student_id = requesterResult.rows[0].id;
    const requester_room_id = requesterResult.rows[0].room_id;
    if (!requester_room_id) return res.status(400).json({ success: false, message: 'You are not assigned to any room' });
    
    const targetResult = await pool.query('SELECT id, room_id FROM students WHERE id = $1', [target_student_id]);
    if (targetResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Target student not found' });
    const target_student_id_val = targetResult.rows[0].id;
    const target_room_id = targetResult.rows[0].room_id;
    if (!target_room_id) return res.status(400).json({ success: false, message: 'Target student has no room assignment' });
    
    const existing = await pool.query('SELECT id FROM room_swap_requests WHERE (requester_student_id = $1 AND target_student_id = $2) AND status = $3', [requester_student_id, target_student_id_val, 'pending']);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'You already have a pending swap request with this student' });
    }
    
    const result = await pool.query(
      `INSERT INTO room_swap_requests 
       (requester_student_id, requester_room_id, target_student_id, target_room_id, reason) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [requester_student_id, requester_room_id, target_student_id_val, target_room_id, reason || null]
    );
    res.json({ success: true, message: 'Swap request sent successfully', id: result.rows[0].id });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/student/my-swap-requests', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [decoded.id]);
    if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const result = await pool.query(`
      SELECT rs.*, 
             s1.first_name as requester_first, s1.last_name as requester_last, s1.student_id as requester_number,
             s2.first_name as target_first, s2.last_name as target_last, s2.student_id as target_number,
             r1.room_number as requester_room, r2.room_number as target_room
      FROM room_swap_requests rs
      JOIN students s1 ON rs.requester_student_id = s1.id
      JOIN students s2 ON rs.target_student_id = s2.id
      JOIN rooms r1 ON rs.requester_room_id = r1.id
      JOIN rooms r2 ON rs.target_room_id = r2.id
      WHERE rs.requester_student_id = $1 OR rs.target_student_id = $1
      ORDER BY rs.created_at DESC
    `, [studentResult.rows[0].id]);
    res.json({ success: true, requests: result.rows });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.put('/api/student/swap-request/:id/respond', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  const { id } = req.params;
  const { action } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [decoded.id]);
    if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    
    if (action === 'accept') {
      const swapResult = await pool.query('SELECT * FROM room_swap_requests WHERE id = $1 AND target_student_id = $2 AND status = $3', [id, studentResult.rows[0].id, 'pending']);
      if (swapResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Swap request not found' });
      
      const requester_id = swapResult.rows[0].requester_student_id;
      const requester_room = swapResult.rows[0].requester_room_id;
      const target_room = swapResult.rows[0].target_room_id;
      
      await pool.query('UPDATE room_assignments SET room_id = $1 WHERE student_id = $2 AND status = $3', [target_room, requester_id, 'active']);
      await pool.query('UPDATE room_assignments SET room_id = $1 WHERE student_id = $2 AND status = $3', [requester_room, studentResult.rows[0].id, 'active']);
      await pool.query('UPDATE students SET room_id = $1 WHERE id = $2', [target_room, requester_id]);
      await pool.query('UPDATE students SET room_id = $1 WHERE id = $2', [requester_room, studentResult.rows[0].id]);
      await pool.query('UPDATE room_swap_requests SET status = $1 WHERE id = $2', ['approved', id]);
      res.json({ success: true, message: 'Room swap completed successfully!' });
    } else {
      await pool.query('UPDATE room_swap_requests SET status = $1 WHERE id = $2 AND target_student_id = $3', ['rejected', id, studentResult.rows[0].id]);
      res.json({ success: true, message: 'Swap request rejected' });
    }
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/admin/swap-requests', async (req, res) => {
  try {
    const result = await pool.query(`
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
    `);
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/swap-requests/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const swapResult = await pool.query('SELECT * FROM room_swap_requests WHERE id = $1 AND status = $2', [id, 'pending']);
    if (swapResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Swap request not found' });
    
    const requester_id = swapResult.rows[0].requester_student_id;
    const requester_room = swapResult.rows[0].requester_room_id;
    const target_id = swapResult.rows[0].target_student_id;
    const target_room = swapResult.rows[0].target_room_id;
    
    await pool.query('UPDATE room_assignments SET room_id = $1 WHERE student_id = $2 AND status = $3', [target_room, requester_id, 'active']);
    await pool.query('UPDATE room_assignments SET room_id = $1 WHERE student_id = $2 AND status = $3', [requester_room, target_id, 'active']);
    await pool.query('UPDATE students SET room_id = $1 WHERE id = $2', [target_room, requester_id]);
    await pool.query('UPDATE students SET room_id = $1 WHERE id = $2', [requester_room, target_id]);
    await pool.query('UPDATE room_swap_requests SET status = $1 WHERE id = $2', ['approved', id]);
    res.json({ success: true, message: 'Swap request approved and rooms swapped' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== ATTENDANCE SYSTEM ==========
app.get('/api/admin/attendance/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, student_id, first_name, last_name FROM students WHERE status = $1', ['active']);
    res.json({ success: true, students: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/attendance', async (req, res) => {
  const { date } = req.query;
  const attendanceDate = date || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(`
      SELECT s.id, s.student_id, s.first_name, s.last_name, 
             a.status, a.check_in_time, a.check_out_time, a.notes, a.id as attendance_id
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id AND a.date = $1
      WHERE s.status = 'active'
      ORDER BY s.first_name ASC
    `, [attendanceDate]);
    res.json({ success: true, attendance: result.rows, date: attendanceDate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/attendance/mark', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { student_id, date, status, check_in_time, check_out_time, notes } = req.body;
    
    const adminResult = await pool.query('SELECT id FROM admins WHERE user_id = $1', [decoded.id]);
    const marked_by = adminResult.rows[0]?.id || null;
    
    await pool.query(
      `INSERT INTO attendance (student_id, date, status, check_in_time, check_out_time, notes, marked_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (student_id, date) DO UPDATE 
       SET status = EXCLUDED.status, 
           check_in_time = EXCLUDED.check_in_time, 
           check_out_time = EXCLUDED.check_out_time, 
           notes = EXCLUDED.notes, 
           marked_by = EXCLUDED.marked_by`,
      [student_id, date, status, check_in_time || null, check_out_time || null, notes || null, marked_by]
    );
    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

app.get('/api/admin/attendance/summary', async (req, res) => {
  const { month, year } = req.query;
  const currentDate = new Date();
  const targetMonth = month || currentDate.getMonth() + 1;
  const targetYear = year || currentDate.getFullYear();
  try {
    const result = await pool.query(`
      SELECT 
        s.id, s.student_id, s.first_name, s.last_name,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
        COUNT(CASE WHEN a.status = 'excused' THEN 1 END) as excused_days,
        COUNT(a.id) as total_days
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id AND EXTRACT(MONTH FROM a.date) = $1 AND EXTRACT(YEAR FROM a.date) = $2
      WHERE s.status = 'active'
      GROUP BY s.id, s.student_id, s.first_name, s.last_name
      ORDER BY s.first_name ASC
    `, [targetMonth, targetYear]);
    res.json({ success: true, summary: result.rows, month: targetMonth, year: targetYear });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/student/my-attendance', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`
      SELECT a.*, TO_CHAR(a.date, 'YYYY-MM-DD') as attendance_date
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE s.user_id = $1
      ORDER BY a.date DESC
      LIMIT 30
    `, [decoded.id]);
    
    const present = result.rows.filter(r => r.status === 'present').length;
    const absent = result.rows.filter(r => r.status === 'absent').length;
    const late = result.rows.filter(r => r.status === 'late').length;
    const total = result.rows.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    res.json({ 
      success: true, 
      attendance: result.rows,
      stats: { present, absent, late, total, percentage }
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

// ========== BULK STUDENT IMPORT ==========
const uploadExcel = multer({ storage: multer.memoryStorage() });

app.post('/api/admin/students/bulk-import', uploadExcel.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const row of data) {
      try {
        if (!row.email || !row.password || !row.firstName || !row.lastName || !row.studentId) {
          errors.push(`Missing required fields for row: ${JSON.stringify(row)}`);
          errorCount++;
          continue;
        }
        
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [row.email]);
        if (existing.rows.length > 0) {
          errors.push(`Email ${row.email} already exists`);
          errorCount++;
          continue;
        }
        
        const hashedPassword = await bcrypt.hash(row.password, 10);
        const userResult = await pool.query(
          'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
          [row.email, hashedPassword, 'student']
        );
        
        await pool.query(
          `INSERT INTO students (user_id, student_id, first_name, last_name, email, phone, major, year, gender, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')`,
          [userResult.rows[0].id, row.studentId, row.firstName, row.lastName, row.email, row.phone || null, row.major || null, row.year || null, row.gender || null]
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
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, message: 'Failed to process file' });
  }
});

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
// ========== ADMIN PROFILE ROUTES ==========
app.get('/api/admin/profile/details', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Fetching admin profile for user_id:', decoded.id);
    
    const result = await pool.query(`
      SELECT a.*, u.email 
      FROM admins a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.user_id = $1
    `, [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Admin profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});