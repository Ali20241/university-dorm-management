import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MyAssignment = () => {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignment();
  }, []);

  const fetchAssignment = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5001/api/student/assignment/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Assignment response:', response.data);
      
      if (response.data.success) {
        setAssignment(response.data.assignment);
      } else {
        setError(response.data.message || 'No assignment found');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
        <Navbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar role="student" />
          <main style={{ flex: 1, padding: '30px' }}>
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading assignment...</div>
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
        <main style={{ flex: 1, padding: '30px' }}>
          
          <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '20px' }}>🏠 My Room Assignment</h1>
          
          {error && (
            <div style={{ 
              background: '#fed7d7', 
              color: '#742a2a', 
              padding: '15px', 
              borderRadius: '10px', 
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}
          
          {!assignment && !error && (
            <div style={{ 
              background: 'white', 
              borderRadius: '15px', 
              padding: '50px', 
              textAlign: 'center' 
            }}>
              <p>You don't have a room assignment yet.</p>
              <p style={{ color: '#718096', marginTop: '10px' }}>
                Apply for a room and wait for admin approval.
              </p>
              <a 
                href="/student/rooms" 
                style={{ 
                  display: 'inline-block', 
                  marginTop: '20px', 
                  background: '#667eea', 
                  color: 'white', 
                  padding: '10px 20px', 
                  borderRadius: '10px', 
                  textDecoration: 'none' 
                }}
              >
                Browse Available Rooms →
              </a>
            </div>
          )}
          
          {assignment && (
            <div style={{ 
              background: 'white', 
              borderRadius: '15px', 
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '10px',
                padding: '20px',
                color: 'white',
                marginBottom: '20px'
              }}>
                <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Room {assignment.room_number}</h2>
                <p>{assignment.building}, Floor {assignment.floor}</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <strong>Room Type:</strong>
                  <p>{assignment.room_type}</p>
                </div>
                <div>
                  <strong>Capacity:</strong>
                  <p>{assignment.capacity} Students</p>
                </div>
                <div>
                  <strong>Assignment Date:</strong>
                  <p>{new Date(assignment.assignment_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <strong>Status:</strong>
                  <p style={{ color: '#48bb78', fontWeight: 'bold' }}>{assignment.status}</p>
                </div>
              </div>
              
              {assignment.description && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <strong>Description:</strong>
                  <p style={{ marginTop: '5px', color: '#4a5568' }}>{assignment.description}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyAssignment;