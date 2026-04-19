import api from '../services/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/student/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return { bg: '#c6f6d5', color: '#22543d', text: '✅ Approved' };
      case 'pending': return { bg: '#fef5e7', color: '#c97d0e', text: '⏳ Pending' };
      case 'rejected': return { bg: '#fed7d7', color: '#742a2a', text: '❌ Rejected' };
      default: return { bg: '#e2e8f0', color: '#4a5568', text: status };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="student" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '10px' }}>📝 My Applications</h1>
            <p style={{ color: '#718096' }}>Track the status of your room applications</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading your applications...</div>
          ) : applications.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '50px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '18px', marginBottom: '15px' }}>You haven't applied for any rooms yet.</p>
              <a href="/student/rooms" style={{
                background: '#667eea',
                color: 'white',
                padding: '10px 25px',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-block'
              }}>Browse Available Rooms →</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {applications.map((app) => {
                const status = getStatusColor(app.status);
                return (
                  <div key={app.id} style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>Room {app.room_number}</h3>
                        <p style={{ color: '#718096', marginBottom: '10px' }}>
                          {app.building}, Floor {app.floor} • {app.room_type}
                        </p>
                        <p style={{ fontSize: '12px', color: '#a0aec0' }}>
                          Applied on: {new Date(app.application_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span style={{
                          background: status.bg,
                          color: status.color,
                          padding: '6px 15px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                    
                    {app.status === 'rejected' && app.reason && (
                      <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        background: '#fed7d7',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}>
                        <strong>Reason:</strong> {app.reason}
                      </div>
                    )}
                    
                    {app.status === 'approved' && (
                      <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        background: '#c6f6d5',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}>
                        🎉 Congratulations! Your application has been approved. Check your room assignment.
                      </div>
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

export default MyApplications;