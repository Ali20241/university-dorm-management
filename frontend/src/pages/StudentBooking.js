import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const StudentBooking = () => {
  const [rooms, setRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    room_id: '',
    start_date: '',
    end_date: '',
    purpose: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [roomsRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/rooms/available', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5001/api/student/my-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setRooms(roomsRes.data.rooms || []);
      setMyBookings(bookingsRes.data.bookings || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/student/book-room', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Booking request submitted!' });
      setShowForm(false);
      setFormData({ room_id: '', start_date: '', end_date: '', purpose: '' });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Booking failed' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm('Cancel this booking?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5001/api/student/cancel-booking/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({ type: 'success', text: 'Booking cancelled!' });
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to cancel' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F7F8FC' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar role="student" />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>📅 Room Booking</h1>
              <p style={{ color: '#6B7280' }}>Book dormitory rooms for events or temporary stay</p>
            </div>
            <button 
              onClick={() => setShowForm(!showForm)}
              style={{
                background: '#5B5CE2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              + New Booking
            </button>
          </div>

          {message && (
            <div style={{
              background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: message.type === 'success' ? '#065F46' : '#991B1B',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {message.text}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginBottom: '20px' }}>New Booking Request</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                  required
                  style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                >
                  <option value="">Select Room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.room_number} - {room.building} (Floor {room.floor})
                    </option>
                  ))}
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280' }}>Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      min={today}
                      required
                      style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280' }}>End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      min={formData.start_date || today}
                      required
                      style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    />
                  </div>
                </div>
                <textarea
                  placeholder="Purpose of booking (optional)"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  rows="3"
                  style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ background: '#5B5CE2', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>Submit Request</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ background: '#E5E7EB', color: '#374151', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '16px' }}>Loading...</div>
          ) : myBookings.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '50px', textAlign: 'center' }}>
              <p>No booking requests yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myBookings.map(booking => (
                <div key={booking.id} style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  borderLeft: `4px solid ${getStatusColor(booking.status)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ marginBottom: '8px' }}>Room {booking.room_number} - {booking.building}</h3>
                      <p><strong>Dates:</strong> {new Date(booking.start_date).toLocaleDateString()} → {new Date(booking.end_date).toLocaleDateString()}</p>
                      <p><strong>Duration:</strong> {booking.duration_days} days</p>
                      {booking.purpose && <p><strong>Purpose:</strong> {booking.purpose}</p>}
                      <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px' }}>Requested: {new Date(booking.created_at).toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        background: getStatusColor(booking.status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        display: 'inline-block',
                        marginBottom: '10px'
                      }}>
                        {booking.status.toUpperCase()}
                      </span>
                      {booking.status === 'pending' && (
                        <button onClick={() => cancelBooking(booking.id)} style={{
                          display: 'block',
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          padding: '6px 15px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          marginTop: '10px'
                        }}>Cancel Request</button>
                      )}
                    </div>
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

export default StudentBooking;