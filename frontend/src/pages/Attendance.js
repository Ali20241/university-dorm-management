import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/admin/attendance?date=${selectedDate}`);
      setAttendance(response.attendance);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/attendance/students');
      setStudents(response.students);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (studentId, status) => {
    setSaving(true);
    try {
      await api.post('/admin/attendance/mark', {
        student_id: studentId,
        date: selectedDate,
        status: status
      });
      fetchAttendance();
      setMessage({ type: 'success', text: 'Attendance updated!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update' });
      setTimeout(() => setMessage(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'present': return { bg: '#22C55E', text: 'Present', icon: '✅' };
      case 'absent': return { bg: '#EF4444', text: 'Absent', icon: '❌' };
      case 'late': return { bg: '#F59E0B', text: 'Late', icon: '⏰' };
      case 'excused': return { bg: '#8B5CF6', text: 'Excused', icon: '📝' };
      default: return { bg: '#6B7280', text: 'Not Marked', icon: '❓' };
    }
  };

  const getCurrentStatus = (studentId) => {
    const record = attendance.find(a => a.id === studentId);
    return record?.status || 'none';
  };

  const summary = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    excused: attendance.filter(a => a.status === 'excused').length,
    total: attendance.length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F7F8FC' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>📋 Attendance Management</h1>
            <p style={{ color: '#6B7280' }}>Mark and track student attendance</p>
          </div>

          {message && (
            <div style={{
              background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: message.type === 'success' ? '#065F46' : '#991B1B',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {message.text}
            </div>
          )}

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontWeight: '500' }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span>✅ Present: <strong>{summary.present}</strong></span>
              <span>❌ Absent: <strong>{summary.absent}</strong></span>
              <span>⏰ Late: <strong>{summary.late}</strong></span>
              <span>📝 Excused: <strong>{summary.excused}</strong></span>
              <span>📊 Total: <strong>{summary.total}</strong></span>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '16px' }}>Loading...</div>
          ) : (
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Student ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Student Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const currentStatus = getCurrentStatus(student.id);
                    const statusInfo = getStatusBadge(currentStatus);
                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid #E5E7EB', background: idx % 2 === 0 ? 'white' : '#F9FAFB' }}>
                        <td style={{ padding: '12px 16px' }}>{student.student_id}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{student.first_name} {student.last_name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: statusInfo.bg,
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px'
                          }}>
                            {statusInfo.icon} {statusInfo.text}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button onClick={() => updateStatus(student.id, 'present')} disabled={saving} style={{ background: '#22C55E', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✅ Present</button>
                            <button onClick={() => updateStatus(student.id, 'absent')} disabled={saving} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>❌ Absent</button>
                            <button onClick={() => updateStatus(student.id, 'late')} disabled={saving} style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>⏰ Late</button>
                            <button onClick={() => updateStatus(student.id, 'excused')} disabled={saving} style={{ background: '#8B5CF6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📝 Excused</button>
                          </div>
                         </td>
                       </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Attendance;