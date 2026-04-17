import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const [studentRes, paymentsRes, maintenanceRes, applicationsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/admin/students/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/admin/students/${id}/payments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/admin/students/${id}/maintenance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/admin/students/${id}/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setStudent(studentRes.data.student);
      setPayments(paymentsRes.data.payments);
      setMaintenance(maintenanceRes.data.maintenance);
      setApplications(applicationsRes.data.applications);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Failed to load student data' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#48bb78';
      case 'pending': return '#ed8936';
      case 'rejected': return '#f56565';
      case 'paid': return '#48bb78';
      case 'unpaid': return '#f56565';
      default: return '#a0aec0';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
        <Navbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar role="admin" />
          <main style={{ flex: 1, padding: '30px' }}>Loading student details...</main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          {/* Header with Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
            <button 
              onClick={() => navigate('/admin/students')}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              ← Back to Students
            </button>
            <h1 style={{ fontSize: '24px', color: '#1a1a2e', margin: 0 }}>Student Details</h1>
          </div>

          {message && (
            <div style={{
              background: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
              color: message.type === 'success' ? '#22543d' : '#742a2a',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {message.text}
            </div>
          )}

          {/* Student Profile Card */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  {student?.profile_image ? (
                    <img src={`http://localhost:5000${student.profile_image}`} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    '👤'
                  )}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ marginBottom: '10px' }}>{student?.first_name} {student?.last_name}</h2>
                <p><strong>Student ID:</strong> {student?.student_id}</p>
                <p><strong>Email:</strong> {student?.email}</p>
                <p><strong>Phone:</strong> {student?.phone || 'Not provided'}</p>
                <p><strong>Major:</strong> {student?.major || 'Not provided'}</p>
                <p><strong>Year:</strong> {student?.year || 'Not provided'}</p>
              </div>
              <div>
                <div style={{
                  background: student?.room_number ? '#c6f6d5' : '#fed7d7',
                  padding: '15px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  minWidth: '180px'
                }}>
                  <strong>Current Room</strong>
                  {student?.room_number ? (
                    <>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '5px' }}>{student.room_number}</p>
                      <p style={{ fontSize: '12px' }}>{student.building}, Floor {student.floor}</p>
                    </>
                  ) : (
                    <p style={{ marginTop: '5px' }}>Not Assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '5px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
            {['info', 'payments', 'maintenance', 'applications'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid #667eea' : '3px solid transparent',
                  color: activeTab === tab ? '#667eea' : '#718096',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? '600' : '400'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div style={{ background: 'white', borderRadius: '15px', padding: '25px' }}>
              <h3>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginTop: '15px' }}>
                <div><strong>Address:</strong> {student?.address || 'Not provided'}</div>
                <div><strong>City:</strong> {student?.city || 'Not provided'}</div>
                <div><strong>Parent/Guardian:</strong> {student?.parent_name || 'Not provided'}</div>
                <div><strong>Parent Phone:</strong> {student?.parent_phone || 'Not provided'}</div>
                <div><strong>Status:</strong> 
                  <span style={{
                    background: student?.status === 'active' ? '#c6f6d5' : '#fed7d7',
                    color: student?.status === 'active' ? '#22543d' : '#742a2a',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    marginLeft: '10px',
                    fontSize: '12px'
                  }}>
                    {student?.status || 'active'}
                  </span>
                </div>
                <div><strong>Registered:</strong> {new Date(student?.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={{ background: 'white', borderRadius: '15px', padding: '25px' }}>
              <h3>Payment & Penalty History</h3>
              {payments.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>No payment records found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f7fafc' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Due Date</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>{p.penalty_type || 'Payment'}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>ETB {parseFloat(p.penalty_amount || p.amount).toFixed(2)}</td>
                        <td style={{ padding: '12px' }}>{new Date(p.due_date).toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: getStatusColor(p.status),
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px'
                          }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div style={{ background: 'white', borderRadius: '15px', padding: '25px' }}>
              <h3>Maintenance Requests</h3>
              {maintenance.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>No maintenance requests found.</p>
              ) : (
                maintenance.map(req => (
                  <div key={req.id} style={{ borderBottom: '1px solid #e2e8f0', padding: '15px 0' }}>
                    <p><strong>{req.title}</strong></p>
                    <p>{req.description}</p>
                    <p><strong>Room:</strong> {req.room_number} | <strong>Priority:</strong> {req.priority} | <strong>Status:</strong> {req.status}</p>
                    <p style={{ fontSize: '12px', color: '#a0aec0' }}>Submitted: {new Date(req.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div style={{ background: 'white', borderRadius: '15px', padding: '25px' }}>
              <h3>Room Applications</h3>
              {applications.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>No applications found.</p>
              ) : (
                applications.map(app => (
                  <div key={app.id} style={{ borderBottom: '1px solid #e2e8f0', padding: '15px 0' }}>
                    <p><strong>Room {app.room_number}</strong> - {app.building}</p>
                    <p><strong>Applied:</strong> {new Date(app.application_date).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> 
                      <span style={{
                        background: getStatusColor(app.status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        marginLeft: '10px'
                      }}>
                        {app.status}
                      </span>
                    </p>
                    {app.reason && <p><strong>Reason:</strong> {app.reason}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDetails;