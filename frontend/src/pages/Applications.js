import React, { useState, useEffect } from 'react';
import api from '../services/api';  // Use the api service instead of direct axios
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/applications/${id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Application approved!' });
      fetchApplications();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Approve error:', error);
      setMessage({ type: 'error', text: 'Failed to approve' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      try {
        const token = localStorage.getItem('token');
        await api.put(`/admin/applications/${id}/reject`, { reason }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({ type: 'success', text: 'Application rejected!' });
        fetchApplications();
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error('Reject error:', error);
        setMessage({ type: 'error', text: 'Failed to reject' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ed8936';
      case 'approved': return '#48bb78';
      case 'rejected': return '#f56565';
      default: return '#a0aec0';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>📋 Room Applications</h1>
          {message && (
            <div style={{
              background: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              color: message.type === 'success' ? '#22543d' : '#742a2a'
            }}>
              {message.text}
            </div>
          )}
          
          {loading ? <p>Loading...</p> : applications.length === 0 ? <p>No applications.</p> : (
            <div style={{ background: 'white', borderRadius: '15px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f7fafc' }}>
                  <tr>
                    <th style={{ padding: '12px' }}>Student</th>
                    <th>Room</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '12px' }}>
                        {app.first_name} {app.last_name}<br/><small>{app.student_id}</small>
                      </td>
                      <td>{app.room_number}</td>
                      <td>{new Date(app.application_date).toLocaleDateString()}</td>
                      <td>
                        <span style={{
                          background: getStatusColor(app.status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px'
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(app.id)}
                              style={{
                                background: '#48bb78',
                                color: 'white',
                                border: 'none',
                                padding: '5px 12px',
                                borderRadius: '5px',
                                marginRight: '5px',
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              style={{
                                background: '#f56565',
                                color: 'white',
                                border: 'none',
                                padding: '5px 12px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Applications;