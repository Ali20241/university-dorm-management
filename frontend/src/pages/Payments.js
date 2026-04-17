import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s) => {
    switch(s) {
      case 'paid': return '#48bb78';
      case 'pending': return '#ed8936';
      case 'overdue': return '#f56565';
      default: return '#a0aec0';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>💰 Payments</h1>
          
          {loading ? <p>Loading...</p> : payments.length === 0 ? <p>No payments.</p> : (
            <div style={{ background: 'white', borderRadius: '15px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f7fafc' }}>
                  <tr><th style={{ padding: '12px' }}>Student</th><th>Amount</th><th>Due Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '12px' }}>{p.first_name} {p.last_name}<br/><small>{p.student_id}</small></td>
                      <td>ETB {parseFloat(p.penalty_amount || p.amount).toFixed(2)}</td>
                      <td>{new Date(p.due_date).toLocaleDateString()}</td>
                      <td><span style={{ background: getStatusColor(p.status), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{p.status}</span></td>
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

export default Payments;