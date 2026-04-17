const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email function
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

// Application Approved Email
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

// Application Rejected Email
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

// Maintenance Status Update Email
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

// Penalty Issued Email
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

module.exports = {
  sendEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendMaintenanceEmail,
  sendPenaltyEmail,
};