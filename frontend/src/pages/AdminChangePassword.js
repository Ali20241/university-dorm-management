import api from '../services/api';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminChangePassword = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (formData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.put('/admin/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: response.message });
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '5px' }}>🔐 Change Password</h1>
            <p style={{ color: '#718096' }}>Update your admin account password</p>
          </div>

          {message && (
            <div style={{
              background: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
              color: message.type === 'success' ? '#22543d' : '#742a2a',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              {message.text}
            </div>
          )}

          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '500px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1a1a2e' }}>Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1a1a2e' }}>New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
                <small style={{ color: '#718096' }}>Minimum 6 characters</small>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1a1a2e' }}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          <div style={{
            marginTop: '20px',
            background: '#fef2f2',
            borderRadius: '10px',
            padding: '15px',
            maxWidth: '500px'
          }}>
            <p style={{ fontSize: '13px', color: '#742a2a' }}>
              ⚠️ For security, keep your password strong and don't share it with anyone.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminChangePassword;