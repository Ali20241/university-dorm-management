import api from '../services/api';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const BulkRooms = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    blocks: '10',
    floors_per_block: 5,
    rooms_per_floor: 22,
    capacity: 6,
    room_type: 'dormitory'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/admin/rooms/bulk', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: response.message });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create rooms' });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRooms = () => {
    const blocks = parseInt(formData.blocks) || 10;
    const floors = parseInt(formData.floors_per_block) || 5;
    const roomsPerFloor = parseInt(formData.rooms_per_floor) || 22;
    return blocks * floors * roomsPerFloor;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '10px' }}>🏢 Bulk Room Creator</h1>
            <p style={{ color: '#718096' }}>Generate multiple dormitory rooms at once</p>
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

          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1a1a2e' }}>Number of Blocks</label>
                  <select
                    name="blocks"
                    value={formData.blocks}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                  >
                    <option value="1">1 Block (A)</option>
                    <option value="2">2 Blocks (A-B)</option>
                    <option value="3">3 Blocks (A-C)</option>
                    <option value="4">4 Blocks (A-D)</option>
                    <option value="5">5 Blocks (A-E)</option>
                    <option value="6">6 Blocks (A-F)</option>
                    <option value="7">7 Blocks (A-G)</option>
                    <option value="8">8 Blocks (A-H)</option>
                    <option value="9">9 Blocks (A-I)</option>
                    <option value="10">10 Blocks (A-J) - All</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1a1a2e' }}>Floors per Block</label>
                  <input
                    type="number"
                    name="floors_per_block"
                    value={formData.floors_per_block}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1a1a2e' }}>Rooms per Floor</label>
                  <input
                    type="number"
                    name="rooms_per_floor"
                    value={formData.rooms_per_floor}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1a1a2e' }}>Capacity per Room</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    max="6"
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1a1a2e' }}>Room Type</label>
                  <select
                    name="room_type"
                    value={formData.room_type}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                  >
                    <option value="single">Single (1 student)</option>
                    <option value="double">Double (2 students)</option>
                    <option value="triple">Triple (3 students)</option>
                    <option value="quad">Quad (4 students)</option>
                    <option value="dormitory">Dormitory (6 students)</option>
                  </select>
                </div>
              </div>

              <div style={{
                marginTop: '25px',
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                  <strong>Total Rooms to Create:</strong> {calculateTotalRooms()} rooms
                </p>
                <p style={{ fontSize: '14px', color: '#718096' }}>
                  This will create rooms with format: Block + Floor + Room Number (e.g., A101, A102, B101, etc.)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '25px',
                  padding: '14px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating Rooms...' : `Create ${calculateTotalRooms()} Rooms`}
              </button>
            </form>
          </div>

          <div style={{
            marginTop: '30px',
            background: '#fef2f2',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid #fecaca'
          }}>
            <h3 style={{ marginBottom: '10px', color: '#dc2626' }}>⚠️ Warning</h3>
            <p style={{ color: '#78350f' }}>
              This will create multiple rooms in your database. Make sure you don't create duplicate room numbers.
              Existing rooms with the same room number will cause an error.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BulkRooms;