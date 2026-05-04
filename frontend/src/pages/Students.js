import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState(null);
  const [newPwd, setNewPwd] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', studentId: '', email: '',
    password: 'Welcome123', phone: '', major: '', year: '1', gender: ''
  });

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(students.filter(s =>
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q) ||
      s.student_id?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.major?.toLowerCase().includes(q)
    ));
  }, [search, students]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/admin/students', { headers: { Authorization: `Bearer ${token}` } });
      setStudents(res.students || []);
    } catch (e) { showMsg('error', 'Failed to load students'); }
    finally { setLoading(false); }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/auth/register', formData, { headers: { Authorization: `Bearer ${token}` } });
      showMsg('success', 'Student added successfully!');
      setShowAddModal(false);
      setFormData({ firstName: '', lastName: '', studentId: '', email: '', password: 'Welcome123', phone: '', major: '', year: '1', gender: '' });
      fetchStudents();
    } catch (e) { showMsg('error', e.response?.data?.message || 'Failed to add student'); }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/students/${selectedStudent.id}/delete`, { headers: { Authorization: `Bearer ${token}` } });
      showMsg('success', 'Student deleted successfully!');
      setShowDeleteModal(false);
      fetchStudents();
    } catch (e) { showMsg('error', 'Failed to delete student'); }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) { showMsg('error', 'Password must be at least 6 characters'); return; }
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/students/${selectedStudent.id}/change-password`, { new_password: newPwd }, { headers: { Authorization: `Bearer ${token}` } });
      showMsg('success', 'Password changed successfully!');
      setShowPwdModal(false);
      setNewPwd('');
    } catch (e) { showMsg('error', 'Failed to change password'); }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fafafa', fontFamily: 'Inter, sans-serif' };

  const genderColor = (g) => g === 'male' ? { bg: '#dbeafe', color: '#1e40af' } : g === 'female' ? { bg: '#fce7f3', color: '#9d174d' } : { bg: '#f3f4f6', color: '#6b7280' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>👥 Students</h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Manage all registered students</p>
            </div>
            <button onClick={() => setShowAddModal(true)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #5B5CE2, #7C3AED)', color: 'white',
              border: 'none', borderRadius: '12px', padding: '11px 20px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(91,92,226,0.3)'
            }}>
              <span>+</span> Add Student
            </button>
          </div>

          {message && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '13px', fontWeight: '500',
              background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total Students', value: students.length, icon: '👥', color: '#5B5CE2', bg: '#eef0ff' },
              { label: 'Male', value: students.filter(s => s.gender === 'male').length, icon: '👨', color: '#3b82f6', bg: '#dbeafe' },
              { label: 'Female', value: students.filter(s => s.gender === 'female').length, icon: '👩', color: '#ec4899', bg: '#fce7f3' },
              { label: 'Active', value: students.filter(s => s.status === 'active').length, icon: '✅', color: '#10b981', bg: '#d1fae5' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', background: c.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{c.icon}</div>
                <div>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: c.color }}>{c.value}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '18px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
            <input
              placeholder="Search by name, ID, email, or major..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '11px 14px 11px 42px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none', background: 'white' }}
              onFocus={e => e.target.style.borderColor = '#5B5CE2'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                {filtered.length} student{filtered.length !== 1 ? 's' : ''} {search && `matching "${search}"`}
              </p>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#5B5CE2', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#6b7280' }}>Loading students...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>No students found</p>
                <p style={{ fontSize: '13px' }}>Try adjusting your search or add a new student</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['#', 'Student', 'Student ID', 'Contact', 'Academic', 'Gender', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => {
                      const gc = genderColor(s.gender);
                      return (
                        <tr key={s.id} style={{ transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: '13px', borderBottom: '1px solid #f9fafb' }}>{i + 1}</td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: `linear-gradient(135deg, hsl(${(i * 47) % 360},60%,60%), hsl(${(i * 47 + 40) % 360},70%,50%))`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0
                              }}>
                                {s.first_name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <p style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>{s.first_name} {s.last_name}</p>
                                <p style={{ fontSize: '11px', color: '#9ca3af' }}>{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <span style={{ fontWeight: '600', color: '#5B5CE2', fontSize: '13px' }}>{s.student_id || '—'}</span>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <p style={{ fontSize: '13px', color: '#374151' }}>{s.phone || '—'}</p>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <p style={{ fontSize: '13px', color: '#374151' }}>{s.major || '—'}</p>
                            <p style={{ fontSize: '11px', color: '#9ca3af' }}>Year {s.year || '?'}</p>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <span style={{ background: gc.bg, color: gc.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' }}>
                              {s.gender || 'N/A'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <span style={{ background: s.status === 'active' ? '#d1fae5' : '#fee2e2', color: s.status === 'active' ? '#065f46' : '#991b1b', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                              {s.status || 'active'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => { setSelectedStudent(s); setShowPwdModal(true); }} style={{ padding: '5px 10px', background: '#eef0ff', color: '#5B5CE2', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                                🔐 Reset
                              </button>
                              <button onClick={() => { setSelectedStudent(s); setShowDeleteModal(true); }} style={{ padding: '5px 10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '560px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a2e' }}>➕ Add New Student</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>First Name *</label>
                  <input name="firstName" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required style={inputStyle} placeholder="First name" /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Last Name *</label>
                  <input name="lastName" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required style={inputStyle} placeholder="Last name" /></div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Student ID *</label>
                <input value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} required style={inputStyle} placeholder="e.g. UGR/12345/15" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Email *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required style={inputStyle} placeholder="student@email.com" /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Password</label>
                  <input value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inputStyle} placeholder="Default: Welcome123" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} placeholder="+251..." /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Major</label>
                  <input value={formData.major} onChange={e => setFormData({ ...formData, major: e.target.value })} style={inputStyle} placeholder="e.g. CS" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Year</label>
                  <select value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {[1,2,3,4,5].map(y => <option key={y} value={y}>{y}</option>)}
                  </select></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select></div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #5B5CE2, #7C3AED)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '400px', maxWidth: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px' }}>Delete Student?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
              This will permanently delete <strong>{selectedStudent.first_name} {selectedStudent.last_name}</strong> and all their data.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPwdModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '400px', maxWidth: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a2e', marginBottom: '6px' }}>🔐 Reset Password</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>For: <strong>{selectedStudent.first_name} {selectedStudent.last_name}</strong></p>
            <form onSubmit={handleChangePwd}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>New Password *</label>
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={6} style={inputStyle} placeholder="Min. 6 characters" />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => { setShowPwdModal(false); setNewPwd(''); }} style={{ flex: 1, padding: '11px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #5B5CE2, #7C3AED)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Students;
