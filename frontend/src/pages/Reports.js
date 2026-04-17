import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('occupancy');
  const [occupancyReport, setOccupancyReport] = useState([]);
  const [paymentReport, setPaymentReport] = useState([]);
  const [penaltyReport, setPenaltyReport] = useState([]);
  const [maintenanceReport, setMaintenanceReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      if (activeTab === 'occupancy') {
        const response = await axios.get('http://localhost:5001/api/admin/reports/occupancy', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOccupancyReport(response.data.report);
      } else if (activeTab === 'payments') {
        const response = await axios.get('http://localhost:5001/api/admin/reports/payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPaymentReport(response.data.report);
      } else if (activeTab === 'penalties') {
        const response = await axios.get('http://localhost:5001/api/admin/penalties', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPenaltyReport(response.data.penalties);
      } else if (activeTab === 'maintenance') {
        const response = await axios.get('http://localhost:5001/api/admin/reports/maintenance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMaintenanceReport(response.data.report);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getOccupancyColor = (percentage) => {
    if (percentage >= 80) return '#f56565';
    if (percentage >= 50) return '#ed8936';
    return '#48bb78';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'emergency': return '#e53e3e';
      case 'high': return '#ed8936';
      case 'medium': return '#ecc94b';
      default: return '#a0aec0';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#ed8936';
      case 'in_progress': return '#4299e1';
      case 'completed': return '#48bb78';
      default: return '#a0aec0';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '10px' }}>📊 Reports & Analytics</h1>
            <p style={{ color: '#718096' }}>View and export dormitory statistics</p>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            {['occupancy', 'payments', 'penalties', 'maintenance'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid #667eea' : '3px solid transparent',
                  color: activeTab === tab ? '#667eea' : '#718096',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? '600' : '400',
                  fontSize: '14px'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Report
              </button>
            ))}
          </div>

          {/* Export Button */}
          {!loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button
                onClick={() => {
                  if (activeTab === 'occupancy') exportToCSV(occupancyReport, 'occupancy_report');
                  else if (activeTab === 'payments') exportToCSV(paymentReport, 'payment_report');
                  else if (activeTab === 'penalties') exportToCSV(penaltyReport, 'penalty_report');
                  else if (activeTab === 'maintenance') exportToCSV(maintenanceReport, 'maintenance_report');
                }}
                style={{
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📥 Export to CSV
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '15px' }}>
              Loading report...
            </div>
          ) : activeTab === 'occupancy' ? (
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', overflow: 'auto' }}>
              <h3 style={{ marginBottom: '20px' }}>Room Occupancy Report</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f7fafc' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Room Number</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Building</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Floor</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Capacity</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Current Occupancy</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Occupancy %</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {occupancyReport.map((room, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{room.room_number}</td>
                      <td style={{ padding: '12px' }}>{room.building}</td>
                      <td style={{ padding: '12px' }}>{room.floor}</td>
                      <td style={{ padding: '12px' }}>{room.capacity}</td>
                      <td style={{ padding: '12px' }}>{room.current_occupancy}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: getOccupancyColor(room.occupancy_percentage),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '20px',
                          fontSize: '12px'
                        }}>
                          {room.occupancy_percentage}%
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: room.room_status === 'available' ? '#c6f6d5' : '#fed7d7',
                          color: room.room_status === 'available' ? '#22543d' : '#742a2a',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px'
                        }}>
                          {room.room_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'payments' ? (
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', overflow: 'auto' }}>
              <h3 style={{ marginBottom: '20px' }}>Payment Summary Report</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f7fafc' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Student ID</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Total Paid</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Pending</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentReport.map((student, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{student.first_name} {student.last_name}</td>
                      <td style={{ padding: '12px' }}>{student.student_id}</td>
                      <td style={{ padding: '12px', color: '#48bb78', fontWeight: 'bold' }}>ETB {parseFloat(student.amount_paid || 0).toFixed(2)}</td>
                      <td style={{ padding: '12px', color: '#f59e0b' }}>ETB {parseFloat(student.amount_pending || 0).toFixed(2)}</td>
                      <td style={{ padding: '12px', color: '#f56565' }}>ETB {parseFloat(student.amount_overdue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'penalties' ? (
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', overflow: 'auto' }}>
              <h3 style={{ marginBottom: '20px' }}>Penalty Report</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f7fafc' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Reason</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {penaltyReport.map((penalty, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{penalty.first_name} {penalty.last_name}</td>
                      <td style={{ padding: '12px' }}>{penalty.penalty_type}</td>
                      <td style={{ padding: '12px' }}>{penalty.penalty_reason?.substring(0, 30)}...</td>
                      <td style={{ padding: '12px', color: '#e94560', fontWeight: 'bold' }}>ETB {parseFloat(penalty.penalty_amount).toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: penalty.status === 'paid' ? '#c6f6d5' : '#fed7d7',
                          color: penalty.status === 'paid' ? '#22543d' : '#742a2a',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px'
                        }}>
                          {penalty.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{new Date(penalty.due_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', overflow: 'auto' }}>
              <h3 style={{ marginBottom: '20px' }}>Maintenance Requests Report</h3>
              
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#e53e3e' }}>
                    {maintenanceReport.filter(r => r.status === 'open').length}
                  </p>
                  <p style={{ fontSize: '12px', color: '#742a2a' }}>Open Requests</p>
                </div>
                <div style={{ background: '#fef5e7', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ed8936' }}>
                    {maintenanceReport.filter(r => r.status === 'in_progress').length}
                  </p>
                  <p style={{ fontSize: '12px', color: '#c97d0e' }}>In Progress</p>
                </div>
                <div style={{ background: '#e6fffa', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#48bb78' }}>
                    {maintenanceReport.filter(r => r.status === 'completed').length}
                  </p>
                  <p style={{ fontSize: '12px', color: '#22543d' }}>Completed</p>
                </div>
                <div style={{ background: '#e9d8fd', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#9f7aea' }}>
                    {maintenanceReport.filter(r => r.priority === 'emergency').length}
                  </p>
                  <p style={{ fontSize: '12px', color: '#553c9a' }}>Emergency Requests</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f7fafc' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Title</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Room</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Priority</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Submitted</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceReport.map((request, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{request.title}</td>
                      <td style={{ padding: '12px' }}>{request.room_number}</td>
                      <td style={{ padding: '12px' }}>{request.first_name} {request.last_name}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: getPriorityColor(request.priority),
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px'
                        }}>
                          {request.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: getStatusColor(request.status),
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px'
                        }}>
                          {request.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{new Date(request.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{request.completion_date ? new Date(request.completion_date).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {maintenanceReport.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>No maintenance requests found.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Reports;