import React from 'react';

const RoomCard = ({ room, onEdit, onDelete, isAdmin }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#48bb78';
      case 'full': return '#f56565';
      case 'maintenance': return '#ed8936';
      default: return '#a0aec0';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'available': return 'Available';
      case 'full': return 'Full';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const getRoomTypeIcon = (type) => {
    switch(type) {
      case 'single': return '🛏️';
      case 'double': return '🛏️🛏️';
      case 'triple': return '🛏️🛏️🛏️';
      case 'quad': return '🛏️🛏️🛏️🛏️';
      case 'dormitory': return '🏘️';
      default: return '🏠';
    }
  };

  const occupancyPercentage = (room.current_occupancy / room.capacity) * 100;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}>
      {/* Card Header */}
      <div style={{
        background: `linear-gradient(135deg, ${getStatusColor(room.room_status)} 0%, ${getStatusColor(room.room_status)}cc 100%)`,
        padding: '12px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '28px' }}>{getRoomTypeIcon(room.room_type)}</span>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500'
          }}>
            {getStatusText(room.room_status)}
          </span>
        </div>
        <h3 style={{ fontSize: '20px', marginTop: '10px', marginBottom: '4px' }}>{room.room_number}</h3>
        <p style={{ fontSize: '12px', opacity: 0.9 }}>{room.building}, Floor {room.floor}</p>
      </div>
      
      {/* Card Body */}
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <p style={{ color: '#a0aec0', fontSize: '11px', marginBottom: '2px' }}>Type</p>
            <p style={{ fontWeight: '500', fontSize: '13px' }}>{room.room_type}</p>
          </div>
          <div>
            <p style={{ color: '#a0aec0', fontSize: '11px', marginBottom: '2px' }}>Capacity</p>
            <p style={{ fontWeight: '500', fontSize: '13px' }}>{room.capacity} students</p>
          </div>
        </div>
        
        {/* Occupancy Bar */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span>Occupancy</span>
            <span>{room.current_occupancy || 0}/{room.capacity}</span>
          </div>
          <div style={{
            height: '6px',
            background: '#e2e8f0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${occupancyPercentage}%`,
              height: '100%',
              background: getStatusColor(room.room_status),
              borderRadius: '3px'
            }} />
          </div>
        </div>
        
        {room.description && (
          <p style={{ color: '#718096', fontSize: '11px', marginBottom: '12px', lineHeight: '1.4' }}>
            {room.description.length > 60 ? room.description.substring(0, 60) + '...' : room.description}
          </p>
        )}
        
        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            <button
              onClick={() => onEdit(room)}
              style={{
                flex: 1,
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(room.id)}
              style={{
                flex: 1,
                background: '#f56565',
                color: 'white',
                border: 'none',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;