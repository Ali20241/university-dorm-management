import api from '../services/api';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AvailableRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState(null);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    fetchRooms();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setStudentId(user.id);
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.rooms || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (roomId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    console.log('User from localStorage:', user);
    
    try {
      const profileResponse = await api.get('/student/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const studentId = profileResponse.student.id;
      console.log('Student ID from profile:', studentId);
      
      const response = await api.post('/student/apply', 
        { room_id: roomId, student_id: studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      setSelectedRoom(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error details:', error.response?.data);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Application failed' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getRoomTypeIcon = (type) => {
    switch(type) {
      case 'single': return '🛏️';
      case 'double': return '🛏️🛏️';
      case 'triple': return '🛏️🛏️🛏️';
      case 'quad': return '🛏️🛏️🛏️🛏️';
      default: return '🏠';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="student" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '10px' }}>🏘️ Available Rooms</h1>
            <p style={{ color: '#718096' }}>Browse and apply for available dormitory rooms</p>
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '15px' }}>
              <p>No rooms available at the moment.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '25px'
            }}>
              {rooms.map(room => (
                <div key={room.id} style={{
                  background: 'white',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s'
                }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${room.room_status === 'available' ? '#667eea' : '#a0aec0'} 0%, #764ba2 100%)`,
                    padding: '20px',
                    color: 'white'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '32px' }}>{getRoomTypeIcon(room.room_type)}</span>
                      <span style={{
                        background: room.room_status === 'available' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px'
                      }}>
                        {room.room_status === 'available' ? 'Available' : 'Occupied'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '24px', marginTop: '15px' }}>{room.room_number}</h3>
                    <p>{room.building}, Floor {room.floor}</p>
                  </div>
                  
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <div>
                        <p style={{ color: '#a0aec0', fontSize: '12px' }}>Room Type</p>
                        <p style={{ fontWeight: '500', color: '#1a1a2e' }}>{room.room_type}</p>
                      </div>
                      <div>
                        <p style={{ color: '#a0aec0', fontSize: '12px' }}>Capacity</p>
                        <p style={{ fontWeight: '500', color: '#1a1a2e' }}>{room.capacity} Students</p>
                      </div>
                    </div>
                    
                    {room.description && (
                      <p style={{ color: '#718096', fontSize: '14px', marginBottom: '15px' }}>{room.description}</p>
                    )}
                    
                    {room.room_status === 'available' ? (
                      <button
                        onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Apply Now
                      </button>
                    ) : (
                      <button disabled style={{
                        width: '100%',
                        padding: '12px',
                        background: '#cbd5e0',
                        color: '#718096',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'not-allowed'
                      }}>
                        Not Available
                      </button>
                    )}
                    
                    {selectedRoom === room.id && room.room_status === 'available' && (
                      <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: '#f7fafc',
                        borderRadius: '10px'
                      }}>
                        <p style={{ marginBottom: '10px' }}>Are you sure you want to apply for this room?</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleApply(room.id)}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#48bb78',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            Yes, Apply
                          </button>
                          <button
                            onClick={() => setSelectedRoom(null)}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#a0aec0',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
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

export default AvailableRooms;