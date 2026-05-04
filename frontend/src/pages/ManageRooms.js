import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [formData, setFormData] = useState({ room_number: '', floor: '', building: '', room_type: 'dormitory', capacity: 6, description: '', room_status: 'available' });

  useEffect(() => { fetchRooms(); }, []);

  useEffect(() => {
    let res = rooms;
    if (search) res = res.filter(r => r.room_number?.toLowerCase().includes(search.toLowerCase()) || r.building?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') res = res.filter(r => r.room_status === statusFilter);
    if (buildingFilter !== 'all') res = res.filter(r => r.building === buildingFilter);
    setFiltered(res);
  }, [search, statusFilter, buildingFilter, rooms]);

  const buildings = [...new Set(rooms.map(r => r.building).filter(Boolean))].sort();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/rooms', { headers: { Authorization: `Bearer ${token}` } });
      setRooms(res.rooms || []);
    } catch (e) { showMsg('error', 'Failed to load rooms'); }
    finally { setLoading(false); }
  };

  const showMsg = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editRoom) {
        await api.put(`/admin/rooms/${editRoom.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        showMsg('success', 'Room updated successfully!');
      } else {
        await api.post('/admin/rooms', formData, { headers: { Authorization: `Bearer ${token}` } });
        showMsg('success', 'Room created successfully!');
      }
      setShowModal(false);
      setEditRoom(null);
      setFormData({ room_number: '', floor: '', building: '', room_type: 'dormitory', capacity: 6, description: '', room_status: 'available' });
      fetchRooms();
    } catch (e) { showMsg('error', e.response?.data?.message || 'Operation failed'); }
  };

  const handleEdit = (room) => {
    setEditRoom(room);
    setFormData({ room_number: room.room_number, floor: room.floor, building: room.building, room_type: room.room_type, capacity: room.capacity, description: room.description || '', room_status: room.room_status });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/rooms/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showMsg('success', 'Room deleted!');
      fetchRooms();
    } catch (e) { showMsg('error', 'Failed to delete room'); }
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.room_status === 'available').length,
    full: rooms.filter(r => r.room_status === 'full').length,
    occupancyPct: rooms.length > 0 ? Math.round((rooms.filter(r => r.room_status === 'full').length / rooms.length) * 100) : 0,
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fafafa', fontFamily: 'Inter, sans-serif' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>🏠 Manage Rooms</h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Add, edit, and manage all dormitory rooms</p>
            </div>
            <button onClick={() => { setEditRoom(null); setFormData({ room_number: '', floor: '', building: '', room_type: 'dormitory', capacity: 6, description: '', room_status: 'available' }); setShowModal(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #5B5CE2, #7C3AED)', color: 'white', border: 'none', borderRadius: '12px', padding: '11px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(91,92,226,0.3)' }}>
              <span>+</span> Add Room
            </button>
          </div>

          {message && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '13px', fontWeight: '500', background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`, display: 'flex', gap: '8px', alignItems: 'center' }}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total Rooms', value: stats.total, icon: '🏠', color: '#5B5CE2', bg: '#eef0ff' },
              { label: 'Available', value: stats.available, icon: '✅', color: '#10b981', bg: '#d1fae5' },
              { label: 'Full', value: stats.full, icon: '🔴', color: '#ef4444', bg: '#fee2e2' },
              { label: 'Occupancy', value: `${stats.occupancyPct}%`, icon: '📊', color: '#f59e0b', bg: '#fef3c7' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', background: c.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{c.icon}</div>
                <div>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: c.color }}>{c.value}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
              <input placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white' }}
                onFocus={e => e.target.style.borderColor = '#5B5CE2'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer' }}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="full">Full</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer' }}>
              <option value="all">All Buildings</option>
              {buildings.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>Showing {filtered.length} of {rooms.length} rooms</p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#5B5CE2', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#6b7280' }}>Loading rooms...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
              {filtered.map(room => (
                <RoomCard key={room.id} room={room} isAdmin onEdit={handleEdit} onDelete={handleDelete} />
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', color: '#9ca3af' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏠</div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>No rooms found</p>
                  <p style={{ fontSize: '13px' }}>Try adjusting your filters or add a new room</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '540px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a2e' }}>{editRoom ? '✏️ Edit Room' : '🏠 Add New Room'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Room Number *</label>
                  <input value={formData.room_number} onChange={e => setFormData({ ...formData, room_number: e.target.value })} required style={inputStyle} placeholder="e.g. A101" /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Floor *</label>
                  <input type="number" value={formData.floor} onChange={e => setFormData({ ...formData, floor: e.target.value })} required style={inputStyle} placeholder="1" /></div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Building *</label>
                <input value={formData.building} onChange={e => setFormData({ ...formData, building: e.target.value })} required style={inputStyle} placeholder="e.g. Building A" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Room Type</label>
                  <select value={formData.room_type} onChange={e => setFormData({ ...formData, room_type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="dormitory">Dormitory</option>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                    <option value="quad">Quad</option>
                  </select></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Capacity *</label>
                  <input type="number" min="1" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} required style={inputStyle} /></div>
              </div>
              {editRoom && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Status</label>
                  <select value={formData.room_status} onChange={e => setFormData({ ...formData, room_status: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="available">Available</option>
                    <option value="full">Full</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Optional room description..." />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #5B5CE2, #7C3AED)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                  {editRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ManageRooms;
