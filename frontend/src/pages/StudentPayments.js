import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const StudentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0, totalOverdue: 0 });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/student/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data.payments);
      
      // Calculate summary
      const paid = response.data.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const pending = response.data.payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const overdue = response.data.payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + parseFloat(p.amount), 0);
      setSummary({ totalPaid: paid, totalPending: pending, totalOverdue: overdue });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return { bg: '#c6f6d5', color: '#22543d', icon: '✅', text: 'Paid' };
      case 'pending': return { bg: '#fef5e7', color: '#c97d0e', icon: '⏳', text: 'Pending' };
      case 'overdue': return { bg: '#fed7d7', color: '#742a2a', icon: '⚠️', text: 'Overdue' };
      default: return { bg: '#e2e8f0', color: '#4a5568', icon: '📄', text: status };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="student" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '5px' }}>💰 Payments</h1>
            <p style={{ color: '#718096' }}>View your payment history and dues</p>
          </div>

          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#48bb78', fontSize: '12px', marginBottom: '5px' }}>Total Paid</p>
              <h2 style={{ fontSize: '28px', color: '#48bb78' }}>${summary.totalPaid.toFixed(2)}</h2>
            </div>
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#ed8936', fontSize: '12px', marginBottom: '5px' }}>Pending</p>
              <h2 style={{ fontSize: '28px', color: '#ed8936' }}>${summary.totalPending.toFixed(2)}</h2>
            </div>
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#f56565', fontSize: '12px', marginBottom: '5px' }}>Overdue</p>
              <h2 style={{ fontSize: '28px', color: '#f56565' }}>${summary.totalOverdue.toFixed(2)}</h2>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading payments...</div>
          ) : payments.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '50px',
              textAlign: 'center'
            }}>
              <p>No payment records found.</p>
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '15px',
              overflow: 'auto',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f7fafc' }}>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Month</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Due Date</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Payment Date</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => {
                    const status = getStatusColor(payment.status);
                    return (
                      <tr key={payment.id} style={{ borderBottom: '1px solid #e2e8f0', background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '15px' }}>
                          {payment.room_number ? `Room ${payment.room_number}` : 'Dormitory Fee'}
                        </td>
                        <td style={{ padding: '15px', fontWeight: '500' }}>${parseFloat(payment.amount).toFixed(2)}</td>
                        <td style={{ padding: '15px' }}>{new Date(payment.due_date).toLocaleDateString()}</td>
                        <td style={{ padding: '15px' }}>
                          {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            background: status.bg,
                            color: status.color,
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {status.icon} {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentPayments;