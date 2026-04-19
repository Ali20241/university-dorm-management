import api from '../services/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    major: '',
    year: '',
    parent_name: '',
    parent_phone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/student/profile/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.profile);
      setFormData({
        phone: response.data.profile.phone || '',
        address: response.data.profile.address || '',
        city: response.data.profile.city || '',
        major: response.data.profile.major || '',
        year: response.data.profile.year || '',
        parent_name: response.data.profile.parent_name || '',
        parent_phone: response.data.profile.parent_phone || ''
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profile_image', file);
    
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/student/upload-photo', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile photo updated!' });
        fetchProfile(); // Refresh profile
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Upload failed' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.put('/student/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
      fetchProfile();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
        <Navbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar role="student" />
          <main style={{ flex: 1, padding: '30px' }}>
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="student" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '5px' }}>👤 My Profile</h1>
              <p style={{ color: '#718096' }}>View and update your personal information</p>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '10px 25px',
                borderRadius: '10px',
                cursor: 'pointer'
              }}>
                Edit Profile
              </button>
            )}
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
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            
            {/* Profile Photo Section */}
            <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: '#e2e8f0',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {profile?.profile_image ? (
                  <img 
                    src={`${profile.profile_image}`} 
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '48px' }}>👤</span>
                )}
              </div>
              <div style={{ marginTop: '15px' }}>
                <label style={{
                  background: '#667eea',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'inline-block'
                }}>
                  {uploading ? 'Uploading...' : '📸 Change Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Full Name</label>
                    <input type="text" value={`${profile.first_name} ${profile.last_name}`} disabled style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: '#f7fafc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Student ID</label>
                    <input type="text" value={profile.student_id} disabled style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: '#f7fafc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Email</label>
                    <input type="email" value={profile.email} disabled style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: '#f7fafc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Major</label>
                    <input type="text" name="major" value={formData.major} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Year</label>
                    <select name="year" value={formData.year} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Parent/Guardian Name</label>
                    <input type="text" name="parent_name" value={formData.parent_name} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Parent/Guardian Phone</label>
                    <input type="tel" name="parent_phone" value={formData.parent_phone} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                  <button type="submit" style={{ background: '#48bb78', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer' }}>Save Changes</button>
                  <button type="button" onClick={() => setEditing(false)} style={{ background: '#a0aec0', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div><strong>Full Name:</strong> {profile.first_name} {profile.last_name}</div>
                <div><strong>Student ID:</strong> {profile.student_id}</div>
                <div><strong>Email:</strong> {profile.email}</div>
                <div><strong>Phone:</strong> {profile.phone || 'Not provided'}</div>
                <div><strong>Major:</strong> {profile.major || 'Not provided'}</div>
                <div><strong>Year:</strong> {profile.year ? profile.year + (profile.year === 1 ? 'st' : profile.year === 2 ? 'nd' : profile.year === 3 ? 'rd' : 'th') + ' Year' : 'Not provided'}</div>
                <div><strong>Address:</strong> {profile.address || 'Not provided'}</div>
                <div><strong>City:</strong> {profile.city || 'Not provided'}</div>
                <div><strong>Parent/Guardian:</strong> {profile.parent_name || 'Not provided'}</div>
                <div><strong>Parent Phone:</strong> {profile.parent_phone || 'Not provided'}</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;