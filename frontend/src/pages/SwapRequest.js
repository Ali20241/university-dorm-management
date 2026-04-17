import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const SwapRequest = () => {
  const [students, setStudents] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    target_student_id: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [studentsRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/students/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/student/my-swap-requests', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStudents(studentsRes.data.students);
      setMyRequests(requestsRes.data.requests);
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
      await axios.post('http://localhost:5000/api/student/swap-request', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Swap request sent!' });
      setShowForm(false);
      setFormData({ target_student_id: '', reason: '' });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send request' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRespond = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/student/swap-request/${id}/respond`, 
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: `Request ${action}ed!` });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to respond' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#22C55E';
      case 'rejected': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F7F8FC' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="student" />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>🔄 Room Swap Request</h1>
              <p style={{ color: '#6B7280' }}>Request to swap rooms with another student</p>
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
              + New Swap Request
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
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Request Room Swap</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Select Student to Swap With</label>
                <select
                  value={formData.target_student_id}
                  onChange={(e) => setFormData({...formData, target_student_id: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                >
                  <option value="">Select a student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.student_id}) - Room {s.room_number || 'No room'}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Reason (Optional)</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows="3"
                  placeholder="Why do you want to swap?"
                  style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ background: '#5B5CE2', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Send Request</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#E5E7EB', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
          ) : myRequests.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '12px', padding: '50px', textAlign: 'center' }}>
              <p>No swap requests yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {myRequests.map(req => (
                <div key={req.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  borderLeft: `4px solid ${getStatusColor(req.status)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap' }}>
                    <div>
                      {req.requester_student_id === req.requester_id ? (
                        <p><strong>You requested to swap with:</strong> {req.target_first} {req.target_last} ({req.target_number})</p>
                      ) : (
                        <p><strong>{req.requester_first} {req.requester_last} requested to swap with you</strong></p>
                      )}
                      <p><strong>Your Room:</strong> {req.requester_room} → <strong>Target Room:</strong> {req.target_room}</p>
                      {req.reason && <p><strong>Reason:</strong> {req.reason}</p>}
                      <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px' }}>
                        Requested: {new Date(req.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        background: getStatusColor(req.status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px'
                      }}>
                        {req.status}
                      </span>
                      {req.status === 'pending' && req.target_student_id === req.target_id && (
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                          <button onClick={() => handleRespond(req.id, 'accept')} style={{ background: '#22C55E', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer' }}>Accept</button>
                          <button onClick={() => handleRespond(req.id, 'reject')} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                        </div>
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

export default SwapRequest;