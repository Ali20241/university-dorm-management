import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { exportStudentsToPDF } from '../utils/pdfExport';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    phone: '',
    major: '',
    year: '',
    gender: '',
    password: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentId: formData.studentId,
        phone: formData.phone,
        major: formData.major,
        year: formData.year,
        gender: formData.gender
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Student added successfully!' });
      setShowAddModal(false);
      setFormData({ firstName: '', lastName: '', email: '', studentId: '', phone: '', major: '', year: '', gender: '', password: '' });
      fetchStudents();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add student' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/admin/students/${studentToDelete.id}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Student deleted successfully!' });
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
      fetchStudents();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete student' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/admin/students/${selectedStudent.id}/change-password`, 
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setShowPasswordModal(false);
      setNewPassword('');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleViewDetails = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  const getGenderLabel = (gender) => {
    if (gender === 'male') return 'Male';
    if (gender === 'female') return 'Female';
    if (gender === 'other') return 'Other';
    return '-';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F7F8FC' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>👥 Registered Students</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => exportStudentsToPDF(students)}
                style={{
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                📄 Export PDF
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                style={{
                  background: '#5B5CE2',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                + Add Student
              </button>
            </div>
          </div>
          
          {message && (
            <div style={{ 
              background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2', 
              color: message.type === 'success' ? '#065F46' : '#991B1B', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {message.text}
            </div>
          )}
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
          ) : (
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'auto', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Student ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Gender</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Phone</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Major</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Year</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #E5E7EB', background: i % 2 === 0 ? 'white' : '#F9FAFB' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{s.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{s.student_id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>{s.first_name} {s.last_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{getGenderLabel(s.gender)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{s.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{s.phone || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{s.major || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{s.year || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleViewDetails(s.id)} style={{ background: '#5B5CE2', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer', fontSize: '12px' }}>View</button>
                        <button onClick={() => { setSelectedStudent(s); setShowPasswordModal(true); }} style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer', fontSize: '12px' }}>Reset PW</button>
                        <button onClick={() => { setStudentToDelete(s); setShowDeleteConfirm(true); }} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Add Student Modal */}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Add New Student</h2>
                <form onSubmit={handleAddStudent}>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <input type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required style={{ padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                      <input type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required style={{ padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                    </div>
                    <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required style={{ padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                    <input type="text" placeholder="Student ID" value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} required style={{ padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                    <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                    <input type="text" placeholder="Major" value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} style={{ padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                    <select value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} style={{ padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }}>
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={{ padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <input type="password" placeholder="Password (min 6 characters)" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required style={{ padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" style={{ flex: 1, background: '#5B5CE2', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Save Student</button>
                    <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
              <div className="modal-content" style={{ textAlign: 'center', width: '350px' }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginBottom: '15px' }}>Delete Student?</h3>
                <p>Are you sure you want to delete <strong>{studentToDelete?.first_name} {studentToDelete?.last_name}</strong>?</p>
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '10px' }}>This action cannot be undone.</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={handleDeleteStudent} style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
                  <button onClick={() => { setShowDeleteConfirm(false); setStudentToDelete(null); }} style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          
          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
              <div className="modal-content" style={{ width: '400px' }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginBottom: '15px' }}>Change Password for {selectedStudent?.first_name} {selectedStudent?.last_name}</h3>
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '12px', margin: '15px 0', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleChangePassword} style={{ flex: 1, background: '#5B5CE2', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                  <button onClick={() => { setShowPasswordModal(false); setNewPassword(''); }} style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Students;