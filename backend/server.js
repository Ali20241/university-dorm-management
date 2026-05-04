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

const pool = require('./config/database');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ========== EMAIL ==========
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({ from: `"DormHub" <${process.env.EMAIL_USER}>`, to, subject, html });
    return true;
  } catch (e) { return false; }
};

// ========== MIDDLEWARE ==========
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { return res.status(401).json({ success: false, message: 'Invalid or expired token' }); }
};

// ========== HEALTH ==========
app.get('/', (req, res) => res.json({ message: 'DormHub API running!' }));
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Server is healthy' }));

// ========== AUTH ==========
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'Login successful', token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName, studentId, phone, major, year, gender } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ success: false, message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const userRes = await pool.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id', [email, hashed, 'student']);
    await pool.query(
      `INSERT INTO students (user_id, student_id, first_name, last_name, email, phone, major, year, gender, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active')`,
      [userRes.rows[0].id, studentId, firstName, lastName, email, phone || null, major || null, year || null, gender || null]
    );
    const token = jwt.sign({ id: userRes.rows[0].id, email, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'Registration successful', token, user: { id: userRes.rows[0].id, email, role: 'student', firstName, lastName } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Email not found' });
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);
    await pool.query('UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3', [token, expiry, email]);
    await sendEmail(email, 'Password Reset', `<p>Reset token: <strong>${token}</strong></p><p>Expires in 1 hour.</p>`);
    res.json({ success: true, message: 'Reset email sent', token });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()', [token]);
    if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE reset_token = $2', [hashed, token]);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ROOMS (Public) ==========
app.get('/api/rooms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY building, room_number');
    res.json({ success: true, count: result.rows.length, rooms: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN DASHBOARD ==========
app.get('/api/admin/dashboard', verifyToken, async (req, res) => {
  try {
    const [students, rooms, available, pending, maintenance, assignments] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM students'),
      pool.query('SELECT COUNT(*) as count FROM rooms'),
      pool.query("SELECT COUNT(*) as count FROM rooms WHERE room_status = 'available'"),
      pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'open'"),
      pool.query("SELECT COUNT(*) as count FROM room_assignments WHERE status = 'active'"),
    ]);
    res.json({
      success: true,
      statistics: {
        totalStudents: parseInt(students.rows[0].count),
        totalRooms: parseInt(rooms.rows[0].count),
        availableRooms: parseInt(available.rows[0].count),
        pendingApplications: parseInt(pending.rows[0].count),
        openMaintenance: parseInt(maintenance.rows[0].count),
        activeAssignments: parseInt(assignments.rows[0].count),
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN STUDENTS ==========
app.get('/api/admin/students', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json({ success: true, count: result.rows.length, students: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/admin/students/:id/details', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.email,
        r.room_number, r.building, r.floor, r.room_type,
        ra.assignment_date, ra.status as assignment_status
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN room_assignments ra ON s.id = ra.student_id AND ra.status = 'active'
      LEFT JOIN rooms r ON ra.room_id = r.id
      WHERE s.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/admin/students/:id/payments', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments WHERE student_id = $1 ORDER BY due_date DESC', [req.params.id]);
    res.json({ success: true, payments: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/admin/students/:id/maintenance', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT mr.*, r.room_number FROM maintenance_requests mr JOIN rooms r ON mr.room_id = r.id WHERE mr.student_id = $1 ORDER BY mr.created_at DESC`, [req.params.id]);
    res.json({ success: true, maintenance: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/admin/students/:id/applications', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT a.*, r.room_number, r.building, r.room_type FROM applications a JOIN rooms r ON a.room_id = r.id WHERE a.student_id = $1 ORDER BY a.application_date DESC`, [req.params.id]);
    res.json({ success: true, applications: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/admin/students/:id/delete', verifyToken, async (req, res) => {
  try {
    const s = await pool.query('SELECT user_id FROM students WHERE id = $1', [req.params.id]);
    if (s.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    await pool.query('DELETE FROM students WHERE id = $1', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [s.rows[0].user_id]);
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.put('/api/admin/students/:id/change-password', verifyToken, async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  try {
    const s = await pool.query('SELECT user_id FROM students WHERE id = $1', [req.params.id]);
    if (s.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, s.rows[0].user_id]);
    res.json({ success: true, message: 'Password changed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN ROOMS ==========
app.post('/api/admin/rooms', verifyToken, async (req, res) => {
  const { room_number, floor, building, room_type, capacity, description } = req.body;
  try {
    const r = await pool.query('INSERT INTO rooms (room_number, floor, building, room_type, capacity, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [room_number, floor, building, room_type, capacity, description]);
    res.json({ success: true, message: 'Room created', roomId: r.rows[0].id });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.put('/api/admin/rooms/:id', verifyToken, async (req, res) => {
  const { room_number, floor, building, room_type, capacity, room_status, description } = req.body;
  try {
    await pool.query('UPDATE rooms SET room_number=$1, floor=$2, building=$3, room_type=$4, capacity=$5, room_status=$6, description=$7 WHERE id=$8',
      [room_number, floor, building, room_type, capacity, room_status, description, req.params.id]);
    res.json({ success: true, message: 'Room updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/admin/rooms/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM rooms WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/admin/rooms/bulk', verifyToken, async (req, res) => {
  const { blocks, floors_per_block, rooms_per_floor, capacity, room_type } = req.body;
  const blockNames = ['A','B','C','D','E','F','G','H','I','J'];
  const blocksToUse = blocks === 'all' ? blockNames : blockNames.slice(0, parseInt(blocks));
  let created = 0;
  try {
    for (const block of blocksToUse) {
      for (let floor = 1; floor <= floors_per_block; floor++) {
        for (let roomNum = 1; roomNum <= rooms_per_floor; roomNum++) {
          const room_number = `${block}${floor}${roomNum.toString().padStart(3,'0')}`;
          await pool.query('INSERT INTO rooms (room_number, floor, building, room_type, capacity, room_status, description) VALUES ($1,$2,$3,$4,$5,$6,$7)',
            [room_number, floor, `Building ${block}`, room_type, capacity, 'available', `Room ${room_number} - Capacity ${capacity} students`]);
          created++;
        }
      }
    }
    res.json({ success: true, message: `${created} rooms created successfully!`, totalRooms: created });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN APPLICATIONS ==========
app.get('/api/admin/applications', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, s.first_name, s.last_name, s.student_id as student_code,
        r.room_number, r.building, r.floor, r.room_type
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN rooms r ON a.room_id = r.id
      ORDER BY a.application_date DESC`);
    res.json({ success: true, applications: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.put('/api/admin/applications/:id/approve', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const appRes = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });
    const { student_id, room_id } = appRes.rows[0];

    // Check for existing active assignment
    const existing = await pool.query("SELECT id FROM room_assignments WHERE student_id = $1 AND status = 'active'", [student_id]);
    if (existing.rows.length > 0) {
      await pool.query("UPDATE room_assignments SET status = 'terminated' WHERE student_id = $1 AND status = 'active'", [student_id]);
    }

    await pool.query('UPDATE applications SET status = $1, reviewed_date = NOW() WHERE id = $2', ['approved', id]);
    await pool.query('INSERT INTO room_assignments (student_id, room_id, assignment_date, status) VALUES ($1,$2,CURRENT_DATE,$3)', [student_id, room_id, 'active']);
    await pool.query(`UPDATE rooms SET current_occupancy = current_occupancy + 1,
      room_status = CASE WHEN current_occupancy + 1 >= capacity THEN 'full' ELSE 'available' END WHERE id = $1`, [room_id]);

    const sd = await pool.query('SELECT s.email, s.first_name, r.room_number FROM students s JOIN rooms r ON r.id = $1 WHERE s.id = $2', [room_id, student_id]);
    if (sd.rows[0]?.email) {
      await sendEmail(sd.rows[0].email, '🎉 Room Application Approved!',
        `<p>Dear ${sd.rows[0].first_name}, your room application for <strong>Room ${sd.rows[0].room_number}</strong> has been approved!</p>`);
    }
    res.json({ success: true, message: 'Application approved and room assigned' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.put('/api/admin/applications/:id/reject', verifyToken, async (req, res) => {
  const { reason } = req.body;
  try {
    const sd = await pool.query('SELECT s.email, s.first_name FROM applications a JOIN students s ON a.student_id = s.id WHERE a.id = $1', [req.params.id]);
    await pool.query('UPDATE applications SET status=$1, reason=$2, reviewed_date=NOW() WHERE id=$3', ['rejected', reason, req.params.id]);
    if (sd.rows[0]?.email) {
      await sendEmail(sd.rows[0].email, 'Room Application Update',
        `<p>Dear ${sd.rows[0].first_name}, your application was rejected. Reason: ${reason || 'No reason provided'}.</p>`);
    }
    res.json({ success: true, message: 'Application rejected' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN MAINTENANCE ==========
app.get('/api/admin/maintenance', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mr.*, r.room_number, s.first_name, s.last_name
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      LEFT JOIN students s ON mr.student_id = s.id
      ORDER BY CASE mr.priority WHEN 'emergency' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, mr.created_at DESC`);
    res.json({ success: true, requests: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.put('/api/admin/maintenance/:id/status', verifyToken, async (req, res) => {
  const { status, notes } = req.body;
  try {
    let q = 'UPDATE maintenance_requests SET status=$1';
    let params = [status];
    if (status === 'completed') { q += ', completion_date=NOW()'; }
    if (notes) { q += `, notes=$${params.length+1}`; params.push(notes); }
    q += ` WHERE id=$${params.length+1}`; params.push(req.params.id);
    await pool.query(q, params);
    const sd = await pool.query('SELECT s.email, s.first_name, mr.title FROM maintenance_requests mr JOIN students s ON mr.student_id = s.id WHERE mr.id = $1', [req.params.id]);
    if (sd.rows[0]?.email) {
      await sendEmail(sd.rows[0].email, `🔧 Maintenance ${status}`,
        `<p>Dear ${sd.rows[0].first_name}, your maintenance request "<strong>${sd.rows[0].title}</strong>" is now <strong>${status}</strong>.</p>`);
    }
    res.json({ success: true, message: 'Status updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN PENALTIES (stored in payments table with penalty_type set) ==========
app.get('/api/admin/penalties', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, s.first_name, s.last_name, s.student_id as student_code, r.room_number
      FROM payments p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN room_assignments ra ON s.id = ra.student_id AND ra.status = 'active'
      LEFT JOIN rooms r ON ra.room_id = r.id
      WHERE p.penalty_type IS NOT NULL
      ORDER BY p.issued_date DESC`);
    res.json({ success: true, penalties: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/admin/penalties', verifyToken, async (req, res) => {
  const { student_id, penalty_amount, penalty_type, penalty_reason, due_date, notes } = req.body;
  try {
    await pool.query(
      `INSERT INTO payments (student_id, penalty_amount, penalty_type, penalty_reason, due_date, notes, status, issued_date, amount)
       VALUES ($1,$2,$3,$4,$5,$6,'unpaid',CURRENT_DATE,$2)`,
      [student_id, penalty_amount, penalty_type, penalty_reason, due_date, notes]
    );
    const sd = await pool.query('SELECT email, first_name FROM students WHERE id = $1', [student_id]);
    if (sd.rows[0]?.email) {
      await sendEmail(sd.rows[0].email, '⚠️ Penalty Notice',
        `<p>Dear ${sd.rows[0].first_name}, a penalty of ETB ${penalty_amount} has been issued. Reason: ${penalty_reason}.</p>`);
    }
    res.json({ success: true, message: 'Penalty issued' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.put('/api/admin/penalties/:id', verifyToken, async (req, res) => {
  const { status, payment_date } = req.body;
  try {
    await pool.query('UPDATE payments SET status=$1, payment_date=$2 WHERE id=$3', [status, payment_date, req.params.id]);
    res.json({ success: true, message: 'Penalty updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/admin/penalties/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM payments WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Penalty deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN PAYMENTS ==========
app.get('/api/admin/payments', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, s.first_name, s.last_name, s.student_id as student_code
      FROM payments p
      JOIN students s ON p.student_id = s.id
      ORDER BY p.due_date DESC`);
    res.json({ success: true, payments: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN REPORTS ==========
app.get('/api/admin/reports/occupancy', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, ROUND((r.current_occupancy::numeric / NULLIF(r.capacity,0)) * 100, 1) as occupancy_percentage
      FROM rooms r ORDER BY r.building, r.room_number`);
    res.json({ success: true, report: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/admin/reports/payments', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.first_name, s.last_name, s.student_id as student_code,
        SUM(CASE WHEN p.status='paid' THEN p.amount ELSE 0 END) as amount_paid,
        SUM(CASE WHEN p.status='pending' THEN p.amount ELSE 0 END) as amount_pending,
        SUM(CASE WHEN p.status='overdue' THEN p.amount ELSE 0 END) as amount_overdue
      FROM students s LEFT JOIN payments p ON s.id = p.student_id
      GROUP BY s.id, s.first_name, s.last_name, s.student_id
      ORDER BY s.last_name`);
    res.json({ success: true, report: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/admin/reports/maintenance', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mr.*, r.room_number, s.first_name, s.last_name
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      LEFT JOIN students s ON mr.student_id = s.id
      ORDER BY mr.created_at DESC`);
    res.json({ success: true, report: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN ROOM ASSIGNMENTS REPORT ==========
app.get('/api/admin/room-assignments', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ra.*, s.first_name, s.last_name, s.student_id as student_code, s.gender,
        r.room_number, r.building, r.floor, r.room_type, r.capacity
      FROM room_assignments ra
      JOIN students s ON ra.student_id = s.id
      JOIN rooms r ON ra.room_id = r.id
      ORDER BY r.building, r.room_number`);
    res.json({ success: true, assignments: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN ATTENDANCE ==========
app.get('/api/admin/attendance', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, s.first_name, s.last_name, s.student_id as student_code, r.room_number
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN room_assignments ra ON s.id = ra.student_id AND ra.status = 'active'
      LEFT JOIN rooms r ON ra.room_id = r.id
      ORDER BY a.date DESC, s.last_name`);
    res.json({ success: true, attendance: result.rows });
  } catch (err) {
    // Table may not exist yet
    res.json({ success: true, attendance: [] });
  }
});

app.post('/api/admin/attendance', verifyToken, async (req, res) => {
  const { student_id, date, status, notes } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM attendance WHERE student_id = $1 AND date = $2', [student_id, date]);
    if (existing.rows.length > 0) {
      await pool.query('UPDATE attendance SET status=$1, notes=$2 WHERE student_id=$3 AND date=$4', [status, notes, student_id, date]);
    } else {
      await pool.query('INSERT INTO attendance (student_id, date, status, notes) VALUES ($1,$2,$3,$4)', [student_id, date, status, notes]);
    }
    res.json({ success: true, message: 'Attendance recorded' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN PROFILE ==========
app.get('/api/admin/profile/details', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    const profile = result.rows[0];
    profile.first_name = profile.email.split('@')[0];
    res.json({ success: true, profile });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.put('/api/admin/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const match = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN BULK IMPORT ==========
app.post('/api/admin/bulk-import', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const wb = XLSX.readFile(req.file.path);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws);
    let created = 0, errors = [];
    for (const row of data) {
      try {
        const email = row.email || row.Email;
        const password = row.password || row.Password || 'Welcome123';
        const firstName = row.first_name || row.firstName || row['First Name'] || '';
        const lastName = row.last_name || row.lastName || row['Last Name'] || '';
        const studentId = row.student_id || row.studentId || row['Student ID'] || '';
        if (!email) continue;
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) { errors.push(`${email}: already exists`); continue; }
        const hashed = await bcrypt.hash(password, 10);
        const userRes = await pool.query('INSERT INTO users (email, password, role) VALUES ($1,$2,$3) RETURNING id', [email, hashed, 'student']);
        await pool.query(`INSERT INTO students (user_id, student_id, first_name, last_name, email, status) VALUES ($1,$2,$3,$4,$5,'active')`,
          [userRes.rows[0].id, studentId, firstName, lastName, email]);
        created++;
      } catch (e) { errors.push(`Row error: ${e.message}`); }
    }
    fs.unlinkSync(req.file.path);
    res.json({ success: true, message: `${created} students imported`, errors });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN SWAP REQUESTS ==========
app.get('/api/admin/swap-requests', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sr.*, 
        s1.first_name as requester_first, s1.last_name as requester_last,
        r1.room_number as current_room,
        r2.room_number as requested_room
      FROM room_swap_requests sr
      JOIN students s1 ON sr.requester_student_id = s1.id
      JOIN rooms r1 ON sr.requester_room_id = r1.id
      JOIN rooms r2 ON sr.target_room_id = r2.id
      ORDER BY sr.created_at DESC`);
    res.json({ success: true, requests: result.rows });
  } catch (err) { res.json({ success: true, requests: [] }); }
});

app.put('/api/admin/swap-requests/:id', verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE room_swap_requests SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ success: true, message: 'Swap request updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== STUDENT PROFILE ==========
app.get('/api/student/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, student: result.rows[0] });
  } catch (err) { res.status(401).json({ success: false, message: err.message }); }
});

app.get('/api/student/profile/details', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.put('/api/student/profile', verifyToken, async (req, res) => {
  const { phone, address, city, major, year, parent_name, parent_phone } = req.body;
  try {
    await pool.query(`UPDATE students SET phone=$1, address=$2, city=$3, major=$4, year=$5, parent_name=$6, parent_phone=$7 WHERE user_id=$8`,
      [phone, address, city, major, year, parent_name, parent_phone, req.user.id]);
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/student/upload-photo', verifyToken, upload.single('profile_image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  try {
    const url = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE students SET profile_image=$1 WHERE user_id=$2', [url, req.user.id]);
    res.json({ success: true, message: 'Photo uploaded', url });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== STUDENT APPLICATIONS ==========
app.get('/api/student/applications', verifyToken, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.json({ success: true, applications: [] });
    const result = await pool.query(`
      SELECT a.*, r.room_number, r.building, r.floor, r.room_type, r.capacity
      FROM applications a JOIN rooms r ON a.room_id = r.id
      WHERE a.student_id = $1 ORDER BY a.application_date DESC`, [student.rows[0].id]);
    res.json({ success: true, applications: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/student/apply', async (req, res) => {
  const { room_id, student_id } = req.body;
  if (!room_id || !student_id) return res.status(400).json({ success: false, message: 'Room ID and Student ID required' });
  try {
    const s = await pool.query('SELECT id FROM students WHERE id = $1', [student_id]);
    if (s.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const existing = await pool.query("SELECT id FROM applications WHERE student_id=$1 AND room_id=$2 AND status!='rejected'", [student_id, room_id]);
    if (existing.rows.length > 0) return res.status(400).json({ success: false, message: 'Already applied for this room' });
    await pool.query('INSERT INTO applications (student_id, room_id, status) VALUES ($1,$2,$3)', [student_id, room_id, 'pending']);
    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== STUDENT ASSIGNMENT ==========
app.get('/api/student/assignment/details', verifyToken, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const result = await pool.query(`
      SELECT ra.*, r.room_number, r.building, r.floor, r.room_type, r.capacity, r.description, r.amenities
      FROM room_assignments ra JOIN rooms r ON ra.room_id = r.id
      WHERE ra.student_id = $1 AND ra.status = 'active'
      LIMIT 1`, [student.rows[0].id]);
    if (result.rows.length === 0) return res.json({ success: false, message: 'No active assignment' });
    res.json({ success: true, assignment: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// studentAPI.getAssignment(id) - legacy
app.get('/api/students/:id/assignment', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ra.*, r.room_number, r.building, r.floor, r.room_type, r.capacity
      FROM room_assignments ra JOIN rooms r ON ra.room_id = r.id
      WHERE ra.student_id = $1 AND ra.status = 'active' LIMIT 1`, [req.params.id]);
    res.json({ success: true, assignment: result.rows[0] || null });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== STUDENT MAINTENANCE ==========
app.get('/api/student/maintenance', verifyToken, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.json({ success: true, requests: [] });
    const result = await pool.query(`
      SELECT mr.*, r.room_number FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      WHERE mr.student_id = $1 ORDER BY mr.created_at DESC`, [student.rows[0].id]);
    res.json({ success: true, requests: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/student/maintenance', verifyToken, async (req, res) => {
  const { room_id, title, description, priority } = req.body;
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    await pool.query('INSERT INTO maintenance_requests (student_id, room_id, title, description, priority, status) VALUES ($1,$2,$3,$4,$5,$6)',
      [student.rows[0].id, room_id, title, description, priority, 'open']);
    res.json({ success: true, message: 'Maintenance request submitted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== STUDENT PAYMENTS ==========
app.get('/api/student/payments', verifyToken, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.json({ success: true, payments: [] });
    const result = await pool.query('SELECT * FROM payments WHERE student_id = $1 ORDER BY due_date DESC', [student.rows[0].id]);
    res.json({ success: true, payments: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/students/:id/payments', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments WHERE student_id = $1 ORDER BY due_date DESC', [req.params.id]);
    res.json({ success: true, payments: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== STUDENT PENALTIES ==========
app.get('/api/student/penalties', verifyToken, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.json({ success: true, penalties: [] });
    const result = await pool.query(
      "SELECT * FROM payments WHERE student_id = $1 AND penalty_type IS NOT NULL ORDER BY issued_date DESC",
      [student.rows[0].id]
    );
    res.json({ success: true, penalties: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== STUDENT NOTIFICATIONS ==========
app.get('/api/student/notifications', verifyToken, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.json({ success: true, notifications: [] });
    const sid = student.rows[0].id;
    const [apps, maint, pens] = await Promise.all([
      pool.query(`SELECT a.*, r.room_number FROM applications a JOIN rooms r ON a.room_id = r.id WHERE a.student_id = $1 ORDER BY a.application_date DESC`, [sid]),
      pool.query(`SELECT mr.*, r.room_number FROM maintenance_requests mr JOIN rooms r ON mr.room_id = r.id WHERE mr.student_id = $1 ORDER BY mr.created_at DESC`, [sid]),
      pool.query("SELECT * FROM payments WHERE student_id = $1 AND penalty_type IS NOT NULL ORDER BY issued_date DESC", [sid]),
    ]);
    res.json({ success: true, applications: apps.rows, maintenance: maint.rows, penalties: pens.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== SWAP REQUESTS (STUDENT) ==========
app.post('/api/student/swap-request', verifyToken, async (req, res) => {
  const { current_room_id, requested_room_id, reason } = req.body;
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    await pool.query(
      'INSERT INTO room_swap_requests (requester_student_id, requester_room_id, target_room_id, reason, status) VALUES ($1,$2,$3,$4,$5)',
      [student.rows[0].id, current_room_id, requested_room_id, reason, 'pending']
    );
    res.json({ success: true, message: 'Swap request submitted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/student/swap-requests', verifyToken, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.json({ success: true, swap_requests: [] });
    const result = await pool.query(`
      SELECT sr.*, r1.room_number as current_room, r2.room_number as requested_room
      FROM room_swap_requests sr
      JOIN rooms r1 ON sr.requester_room_id = r1.id
      JOIN rooms r2 ON sr.target_room_id = r2.id
      WHERE sr.requester_student_id = $1 ORDER BY sr.created_at DESC`, [student.rows[0].id]);
    res.json({ success: true, swap_requests: result.rows });
  } catch (err) { res.json({ success: true, requests: [] }); }
});

// ========== STUDENT BOOKING ==========
app.post('/api/student/booking', verifyToken, async (req, res) => {
  const { room_id } = req.body;
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    await pool.query("INSERT INTO applications (student_id, room_id, status) VALUES ($1,$2,'pending')", [student.rows[0].id, room_id]);
    res.json({ success: true, message: 'Booking request submitted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/student/bookings', verifyToken, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.json({ success: true, bookings: [] });
    const result = await pool.query(`
      SELECT b.*, r.room_number, r.building, r.floor,
        EXTRACT(DAY FROM (b.check_out_date - b.check_in_date)) as duration_days
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.student_id = $1 ORDER BY b.created_at DESC`, [student.rows[0].id]);
    res.json({ success: true, bookings: result.rows });
  } catch (err) { res.json({ success: true, bookings: [] }); }
});

app.put('/api/student/booking/:id/cancel', verifyToken, async (req, res) => {
  try {
    await pool.query("UPDATE bookings SET status='cancelled' WHERE id=$1", [req.params.id]);
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN UPLOAD PHOTO ==========
app.post('/api/admin/upload-photo', verifyToken, upload.single('profile_image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, message: 'Photo uploaded successfully', image_url: imageUrl });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN REPORTS: ROOM ASSIGNMENTS ==========
app.get('/api/admin/reports/assignments', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ra.id, ra.assignment_date, ra.status,
        s.first_name, s.last_name, s.student_id as student_number, s.email, s.phone, s.major, s.year,
        r.room_number, r.building, r.floor, r.room_type, r.id as room_id
      FROM room_assignments ra
      JOIN students s ON ra.student_id = s.id
      JOIN rooms r ON ra.room_id = r.id
      WHERE ra.status = 'active'
      ORDER BY r.building, r.room_number`);
    res.json({ success: true, assignments: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ========== ADMIN SWAP REQUESTS: FIX COLUMN NAME ==========
// Return swap_requests key (frontend uses this)
app.get('/api/admin/swap-requests-v2', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sr.*,
        s1.first_name as requester_first, s1.last_name as requester_last,
        r1.room_number as requester_room,
        r2.room_number as target_room
      FROM room_swap_requests sr
      JOIN students s1 ON sr.requester_student_id = s1.id
      JOIN rooms r1 ON sr.requester_room_id = r1.id
      JOIN rooms r2 ON sr.target_room_id = r2.id
      ORDER BY sr.created_at DESC`);
    res.json({ success: true, swap_requests: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✓ DormHub server running on port ${PORT}`));
