import api from '../services/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const StudentMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    room_id: '',
    title: '',
    description: '',
    priority: 'medium'
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchRequests();
    fetchRooms();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/student/maintenance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/student/maintenance', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Maintenance request submitted!' });
      setShowForm(false);
      setFormData({ room_id: '', title: '', description: '', priority: 'medium' });
      fetchRequests();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit request' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'emergency': return { bg: '#fed7d7', color: '#742a2a', label: '🚨 Emergency' };
      case 'high': return { bg: '#feebc8', color: '#c97d0e', label: '⚠️ High' };
      case 'medium': return { bg: '#fef5e7', color: '#975a0e', label: '📌 Medium' };
      default: return { bg: '#e2e8f0', color: '#4a5568', label: '🔹 Low' };
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return { bg: '#fed7d7', color: '#742a2a', label: 'Open' };
      case 'in_progress': return { bg: '#feebc8', color: '#c97d0e', label: 'In Progress' };
      case 'completed': return { bg: '#c6f6d5', color: '#22543d', label: 'Completed' };
      default: return { bg: '#e2e8f0', color: '#4a5568', label: status };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="student" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '5px' }}>🔧 Maintenance Requests</h1>
              <p style={{ color: '#718096' }}>Submit and track repair requests for your room</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              + New Request
            </button>
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

          {showForm && (
            <form onSubmit={handleSubmit} style={{
              background: 'white',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Submit New Request</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                  required
                  style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="">Select Room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.room_number} - {room.building}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Issue Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
                
                <textarea
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows="4"
                  style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
                
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="low">Low - Minor issue</option>
                  <option value="medium">Medium - Needs attention</option>
                  <option value="high">High - Urgent</option>
                  <option value="emergency">Emergency - Immediate!</option>
                </select>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    background: '#48bb78',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    flex: 1
                  }}>Submit Request</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{
                    background: '#a0aec0',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    flex: 1
                  }}>Cancel</button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '50px',
              textAlign: 'center'
            }}>
              <p>No maintenance requests yet.</p>
              <p style={{ fontSize: '14px', color: '#718096', marginTop: '10px' }}>Click "New Request" to submit one.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {requests.map(req => {
                const priority = getPriorityColor(req.priority);
                const status = getStatusColor(req.status);
                return (
                  <div key={req.id} style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>{req.title}</h3>
                        <p style={{ color: '#718096', fontSize: '14px' }}>Room: {req.room_number}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ background: priority.bg, color: priority.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                          {priority.label}
                        </span>
                        <span style={{ background: status.bg, color: status.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <p style={{ color: '#4a5568', marginBottom: '10px' }}>{req.description}</p>
                    <p style={{ fontSize: '11px', color: '#a0aec0' }}>
                      Submitted: {new Date(req.created_at).toLocaleString()}
                    </p>
                    {req.status === 'completed' && req.completion_date && (
                      <p style={{ fontSize: '11px', color: '#48bb78', marginTop: '5px' }}>
                        Completed: {new Date(req.completion_date).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentMaintenance;