import React, { useState, useEffect } from 'react';
import api from '../services/api';  // Use the api service instead of direct axios
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Penalties = () => {
  const [penalties, setPenalties] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    penalty_amount: '',
    penalty_type: 'damage',
    penalty_reason: '',
    due_date: '',
    notes: ''
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPenalties();
    fetchStudents();
  }, []);

  const fetchPenalties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/penalties', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPenalties(response.data.penalties);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/admin/penalties', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Penalty issued successfully!' });
      setShowForm(false);
      setFormData({ student_id: '', penalty_amount: '', penalty_type: 'damage', penalty_reason: '', due_date: '', notes: '' });
      fetchPenalties();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to issue penalty' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const markAsPaid = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/penalties/${id}`, 
        { status: 'paid', payment_date: new Date().toISOString().split('T')[0] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPenalties();
      setMessage({ type: 'success', text: 'Penalty marked as paid!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getPenaltyTypeIcon = (type) => {
    switch(type) {
      case 'damage': return '💔';
      case 'rule_violation': return '📜';
      case 'late_fee': return '⏰';
      default: return '⚠️';
    }
  };

  const getPenaltyTypeLabel = (type) => {
    switch(type) {
      case 'damage': return 'Property Damage';
      case 'rule_violation': return 'Rule Violation';
      case 'late_fee': return 'Late Fee';
      default: return 'Other';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '5px' }}>⚠️ Penalty Management</h1>
              <p style={{ color: '#718096' }}>Issue and track fines for damages, rule violations, and late fees</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} style={{
              background: '#e94560',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              + Issue Penalty
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
              <h3 style={{ marginBottom: '20px', color: '#e94560' }}>Issue New Penalty</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  required
                  style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.student_id})</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  placeholder="Penalty Amount (Birr)"
                  value={formData.penalty_amount}
                  onChange={(e) => setFormData({...formData, penalty_amount: e.target.value})}
                  required
                  style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
                
                <select
                  value={formData.penalty_type}
                  onChange={(e) => setFormData({...formData, penalty_type: e.target.value})}
                  style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="damage">💔 Property Damage</option>
                  <option value="rule_violation">📜 Rule Violation</option>
                  <option value="late_fee">⏰ Late Fee</option>
                  <option value="other">⚠️ Other</option>
                </select>
                
                <input
                  type="date"
                  placeholder="Due Date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  required
                  style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              
              <textarea
                placeholder="Detailed reason for penalty..."
                value={formData.penalty_reason}
                onChange={(e) => setFormData({...formData, penalty_reason: e.target.value})}
                required
                rows="3"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '15px' }}
              />
              
              <textarea
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="2"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '15px' }}
              />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{
                  background: '#e94560',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>Issue Penalty</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  background: '#a0aec0',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading penalties...</div>
          ) : penalties.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '15px', padding: '50px', textAlign: 'center' }}>
              <p>No penalties issued yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {penalties.map(penalty => (
                <div key={penalty.id} style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{getPenaltyTypeIcon(penalty.penalty_type)}</span>
                        <h3 style={{ margin: 0 }}>{getPenaltyTypeLabel(penalty.penalty_type)}</h3>
                      </div>
                      <p><strong>Student:</strong> {penalty.first_name} {penalty.last_name} ({penalty.student_id})</p>
                      <p><strong>Room:</strong> {penalty.room_number || 'Not assigned'}</p>
                      <p><strong>Reason:</strong> {penalty.penalty_reason}</p>
                      {penalty.notes && <p><strong>Notes:</strong> {penalty.notes}</p>}
                      <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '10px' }}>
                        Issued: {new Date(penalty.issued_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#e94560' }}>ETB {parseFloat(penalty.penalty_amount).toFixed(2)}</p>
                      <p style={{ fontSize: '12px', color: '#a0aec0' }}>Due: {new Date(penalty.due_date).toLocaleDateString()}</p>
                      <span style={{
                        display: 'inline-block',
                        background: penalty.status === 'paid' ? '#c6f6d5' : '#fed7d7',
                        color: penalty.status === 'paid' ? '#22543d' : '#742a2a',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        marginTop: '10px'
                      }}>
                        {penalty.status === 'paid' ? '✅ Paid' : '⚠️ Unpaid'}
                      </span>
                      {penalty.status !== 'paid' && (
                        <button
                          onClick={() => markAsPaid(penalty.id)}
                          style={{
                            display: 'block',
                            width: '100%',
                            marginTop: '10px',
                            background: '#48bb78',
                            color: 'white',
                            border: 'none',
                            padding: '8px 15px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          Mark as Paid
                        </button>
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

export default Penalties;