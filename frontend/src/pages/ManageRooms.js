import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';
import { exportRoomsToPDF } from '../utils/pdfExport';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    room_number: '',
    floor: '',
    building: '',
    room_type: 'dormitory',
    capacity: '6',
    description: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [searchTerm, filterBuilding, filterStatus, rooms]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data.rooms);
      setFilteredRooms(response.data.rooms);
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to load rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = [...rooms];
    
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.building.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterBuilding !== 'all') {
      filtered = filtered.filter(room => room.building === filterBuilding);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(room => room.room_status === filterStatus);
    }
    
    setFilteredRooms(filtered);
  };

  const showToast = (msg, type = 'success') => {
    setMessage({ type, text: msg });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      if (editingRoom) {
        await axios.put(`http://localhost:5000/api/admin/rooms/${editingRoom.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Room updated successfully!', 'success');
      } else {
        await axios.post('http://localhost:5000/api/admin/rooms', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Room created successfully!', 'success');
      }
      fetchRooms();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/admin/rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchRooms();
        showToast('Room deleted successfully!', 'success');
      } catch (error) {
        showToast(error.response?.data?.message || 'Delete failed', 'error');
      }
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      floor: room.floor,
      building: room.building,
      room_type: room.room_type,
      capacity: room.capacity,
      description: room.description || ''
    });
    setShowModal(true);
  };

  const openModal = () => {
    setEditingRoom(null);
    setFormData({ room_number: '', floor: '', building: '', room_type: 'dormitory', capacity: '6', description: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
  };

  const buildings = ['all', ...new Set(rooms.map(r => r.building))];
  const statuses = ['all', 'available', 'full', 'maintenance'];

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.room_status === 'available').length;
  const fullRooms = rooms.filter(r => r.room_status === 'full').length;
  const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + r.current_occupancy, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h1 style={{ fontSize: '24px', color: '#1a1a2e', marginBottom: '4px' }}>🏠 Room Management</h1>
              <p style={{ color: '#718096', fontSize: '13px' }}>Manage dormitory rooms in a visual grid layout</p>
            </div>
            <button 
              onClick={openModal}
              style={{
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              + Add New Room
            </button>
            <button onClick={() => exportRoomsToPDF(rooms)} style={{
  background: '#EF4444',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  cursor: 'pointer'
}}>
  📄 Export PDF
</button>
          </div>

          {/* Toast Message */}
          {message && (
            <div style={{
              position: 'fixed',
              top: '80px',
              right: '20px',
              background: message.type === 'success' ? '#48bb78' : '#f56565',
              color: 'white',
              padding: '10px 18px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              fontSize: '13px',
              animation: 'slideIn 0.3s ease'
            }}>
              {message.text}
            </div>
          )}

          {/* Compact Statistics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'white', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <p style={{ color: '#667eea', fontSize: '11px', margin: 0 }}>Total Rooms</p>
              <h2 style={{ fontSize: '22px', color: '#1a1a2e', margin: '5px 0 0' }}>{totalRooms}</h2>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <p style={{ color: '#48bb78', fontSize: '11px', margin: 0 }}>Available</p>
              <h2 style={{ fontSize: '22px', color: '#48bb78', margin: '5px 0 0' }}>{availableRooms}</h2>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <p style={{ color: '#f56565', fontSize: '11px', margin: 0 }}>Full</p>
              <h2 style={{ fontSize: '22px', color: '#f56565', margin: '5px 0 0' }}>{fullRooms}</h2>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <p style={{ color: '#ed8936', fontSize: '11px', margin: 0 }}>Occupancy</p>
              <h2 style={{ fontSize: '22px', color: '#ed8936', margin: '5px 0 0' }}>{totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0}%</h2>
            </div>
          </div>

          {/* Compact Filters */}
          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ flex: 2, minWidth: '180px' }}>
              <input
                type="text"
                placeholder="🔍 Search room or building..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}
              />
            </div>
            <select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontSize: '13px' }}
            >
              {buildings.map(b => (
                <option key={b} value={b}>{b === 'all' ? 'All Buildings' : `Building ${b}`}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontSize: '13px' }}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            {(searchTerm || filterBuilding !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setFilterBuilding('all'); setFilterStatus('all'); }}
                style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Compact Rooms Grid - 240px cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
              <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#667eea', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              Loading rooms...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
              <p>No rooms found matching your criteria.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '15px'
            }}>
              {filteredRooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isAdmin={true}
                />
              ))}
            </div>
          )}

          {/* Modal for Add/Edit Room */}
          {showModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                width: '450px',
                maxWidth: '90%',
                maxHeight: '85%',
                overflow: 'auto',
                animation: 'scaleIn 0.2s ease'
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h2 style={{ margin: 0, fontSize: '18px' }}>{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
                  <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Room Number (e.g., A101)"
                      value={formData.room_number}
                      onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                      required
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                    />
                    <input
                      type="number"
                      placeholder="Floor"
                      value={formData.floor}
                      onChange={(e) => setFormData({...formData, floor: e.target.value})}
                      required
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                    />
                    <input
                      type="text"
                      placeholder="Building"
                      value={formData.building}
                      onChange={(e) => setFormData({...formData, building: e.target.value})}
                      required
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                    />
                    <select
                      value={formData.room_type}
                      onChange={(e) => setFormData({...formData, room_type: e.target.value})}
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="single">Single (1 student)</option>
                      <option value="double">Double (2 students)</option>
                      <option value="triple">Triple (3 students)</option>
                      <option value="quad">Quad (4 students)</option>
                      <option value="dormitory">Dormitory (6 students)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Capacity"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      required
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="2"
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" style={{
                      flex: 1,
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      {editingRoom ? 'Update Room' : 'Create Room'}
                    </button>
                    <button type="button" onClick={closeModal} style={{
                      flex: 1,
                      background: '#a0aec0',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ManageRooms;