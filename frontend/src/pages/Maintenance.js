import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/admin/maintenance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:5001/api/admin/maintenance/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchRequests();
  };

  const getPriorityColor = (p) => {
    switch(p) {
      case 'emergency': return '#e53e3e';
      case 'high': return '#ed8936';
      case 'medium': return '#ecc94b';
      default: return '#a0aec0';
    }
  };

  const getStatusColor = (s) => {
    switch(s) {
      case 'open': return '#ed8936';
      case 'in_progress': return '#4299e1';
      case 'completed': return '#48bb78';
      default: return '#a0aec0';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🔧 Maintenance Requests</h1>
          
          {loading ? <p>Loading...</p> : requests.length === 0 ? <p>No requests.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {requests.map(req => (
                <div key={req.id} style={{ background: 'white', borderRadius: '15px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap' }}>
                    <div><h3>{req.title}</h3><p>{req.description}</p><p><strong>Room:</strong> {req.room_number} | <strong>Student:</strong> {req.first_name} {req.last_name}</p><p><small>Submitted: {new Date(req.created_at).toLocaleString()}</small></p></div>
                    <div><span style={{ background: getPriorityColor(req.priority), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', marginRight: '10px' }}>{req.priority}</span>
                    <select value={req.status} onChange={(e) => updateStatus(req.id, e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', background: getStatusColor(req.status), color: 'white' }}><option value="open">Open</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Maintenance;