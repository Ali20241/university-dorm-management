import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const RoomAssignmentsReport = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/admin/reports/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Email', 'Phone', 'Major', 'Year', 'Room Number', 'Building', 'Floor', 'Room Type', 'Assignment Date'];
    const rows = assignments.map(a => [
      a.student_number,
      `${a.first_name} ${a.last_name}`,
      a.email,
      a.phone || '',
      a.major || '',
      a.year || '',
      a.room_number,
      a.building,
      a.floor,
      a.room_type,
      new Date(a.assignment_date).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'room_assignments_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get unique buildings for filter
  const buildings = ['all', ...new Set(assignments.map(a => a.building))];
  
  // Filter assignments
  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = searchTerm === '' || 
      a.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = filterBuilding === 'all' || a.building === filterBuilding;
    return matchesSearch && matchesBuilding;
  });

  // Statistics
  const totalStudents = assignments.length;
  const totalRooms = new Set(assignments.map(a => a.room_id)).size;
  const buildingStats = {};
  assignments.forEach(a => {
    buildingStats[a.building] = (buildingStats[a.building] || 0) + 1;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '5px' }}>📋 Room Assignment Report</h1>
              <p style={{ color: '#718096' }}>View all current student room assignments</p>
            </div>
            <button 
              onClick={exportToCSV}
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

          {/* Statistics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#667eea', fontSize: '12px' }}>Total Assigned Students</p>
              <h2 style={{ fontSize: '32px', color: '#667eea' }}>{totalStudents}</h2>
            </div>
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#48bb78', fontSize: '12px' }}>Occupied Rooms</p>
              <h2 style={{ fontSize: '32px', color: '#48bb78' }}>{totalRooms}</h2>
            </div>
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#ed8936', fontSize: '12px' }}>Buildings</p>
              <h2 style={{ fontSize: '32px', color: '#ed8936' }}>{Object.keys(buildingStats).length}</h2>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by name, student ID, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: 'white'
              }}
            >
              {buildings.map(b => (
                <option key={b} value={b}>{b === 'all' ? 'All Buildings' : `Building ${b}`}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '15px' }}>Loading assignments...</div>
          ) : filteredAssignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '15px' }}>
              <p>No room assignments found.</p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '15px', overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f7fafc', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Student ID</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Major</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Room Number</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Building</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Floor</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Room Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Assigned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a, index) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0', background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '12px' }}>{a.student_number}</td>
                      <td style={{ padding: '12px' }}>
                        <strong>{a.first_name} {a.last_name}</strong>
                      </td>
                      <td style={{ padding: '12px' }}>{a.email}</td>
                      <td style={{ padding: '12px' }}>{a.major || '-'}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#667eea' }}>{a.room_number}</td>
                      <td style={{ padding: '12px' }}>{a.building}</td>
                      <td style={{ padding: '12px' }}>{a.floor}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: '#e2e8f0',
                          padding: '4px 8px',
                          borderRadius: '20px',
                          fontSize: '11px'
                        }}>
                          {a.room_type}
                        </span>
                       </td>
                      <td style={{ padding: '12px' }}>{new Date(a.assignment_date).toLocaleDateString()} </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Building Summary */}
          <div style={{ marginTop: '25px', background: 'white', borderRadius: '15px', padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Building Summary</h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {Object.entries(buildingStats).map(([building, count]) => (
                <div key={building} style={{
                  background: '#f7fafc',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <strong>Building {building}</strong>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '5px' }}>{count}</p>
                  <p style={{ fontSize: '11px', color: '#718096' }}>students</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RoomAssignmentsReport;