import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, totalRooms: 0, availableRooms: 0, pendingApplications: 0, openMaintenance: 0, activeAssignments: 0 });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    fetchStats();
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening');
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.statistics);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const occupancyPct = stats.totalRooms > 0 ? Math.round(((stats.totalRooms - stats.availableRooms) / stats.totalRooms) * 100) : 0;

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: '👥', color: '#5B5CE2', bg: '#eef0ff', path: '/admin/students', trend: '+2 this week' },
    { title: 'Total Rooms', value: stats.totalRooms, icon: '🏠', color: '#10b981', bg: '#d1fae5', path: '/admin/rooms', trend: 'Across all buildings' },
    { title: 'Available Rooms', value: stats.availableRooms, icon: '✅', color: '#f59e0b', bg: '#fef3c7', path: '/admin/rooms', trend: `${occupancyPct}% occupied` },
    { title: 'Pending Applications', value: stats.pendingApplications, icon: '📋', color: '#8b5cf6', bg: '#f5f3ff', path: '/admin/applications', trend: 'Need review' },
    { title: 'Open Maintenance', value: stats.openMaintenance, icon: '🔧', color: '#ef4444', bg: '#fee2e2', path: '/admin/maintenance', trend: 'Awaiting action' },
    { title: 'Active Assignments', value: stats.activeAssignments, icon: '🛏️', color: '#06b6d4', bg: '#cffafe', path: '/admin/room-assignments-report', trend: 'Currently assigned' },
  ];

  const quickActions = [
    { label: 'Add Student', path: '/admin/students', icon: '👤', color: '#5B5CE2' },
    { label: 'Manage Rooms', path: '/admin/rooms', icon: '🏠', color: '#10b981' },
    { label: 'Review Applications', path: '/admin/applications', icon: '📋', color: '#8b5cf6' },
    { label: 'Maintenance', path: '/admin/maintenance', icon: '🔧', color: '#f59e0b' },
    { label: 'Issue Penalty', path: '/admin/penalties', icon: '⚠️', color: '#ef4444' },
    { label: 'View Reports', path: '/admin/reports', icon: '📊', color: '#06b6d4' },
    { label: 'Bulk Rooms', path: '/admin/bulk-rooms', icon: '🏢', color: '#ec4899' },
    { label: 'Bulk Import', path: '/admin/bulk-import', icon: '📤', color: '#6366f1' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>

          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRadius: '24px', padding: '28px 32px', marginBottom: '24px',
            color: 'white', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '200px', height: '200px', background: 'rgba(91,92,226,0.15)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', right: '60px', bottom: '-40px', width: '140px', height: '140px', background: 'rgba(124,58,237,0.1)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ opacity: 0.7, fontSize: '13px', marginBottom: '6px' }}>{greeting}!</p>
                <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                  {user?.email?.split('@')[0] || 'Admin'} 👋
                </h1>
                <p style={{ opacity: 0.75, fontSize: '14px' }}>
                  Here's an overview of your dormitory system today.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '14px 20px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
                  <p style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Occupancy Rate</p>
                  <p style={{ fontSize: '28px', fontWeight: '800' }}>{occupancyPct}%</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '14px 20px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
                  <p style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Students</p>
                  <p style={{ fontSize: '28px', fontWeight: '800' }}>{stats.activeAssignments}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '14px 20px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
                  <p style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Time</p>
                  <p style={{ fontSize: '22px', fontWeight: '800' }}>{time}</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#5B5CE2', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                {statCards.map((c, i) => (
                  <div key={i}
                    onClick={() => navigate(c.path)}
                    style={{
                      background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e5e7eb',
                      cursor: 'pointer', transition: 'all 0.25s', position: 'relative', overflow: 'hidden'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ width: '50px', height: '50px', background: c.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        {c.icon}
                      </div>
                      <span style={{ fontSize: '10px', color: c.color, background: c.bg, padding: '4px 8px', borderRadius: '20px', fontWeight: '600' }}>
                        {c.trend}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '30px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>{c.value.toLocaleString()}</h3>
                    <p style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>{c.title}</p>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: c.color, borderRadius: '0 0 20px 20px', opacity: 0.6 }} />
                  </div>
                ))}
              </div>

              {/* Occupancy Visual + Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>

                {/* Occupancy Card */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📊</span> Room Occupancy Overview
                  </h3>

                  {/* Big gauge */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <svg width="160" height="90" viewBox="0 0 160 90">
                        <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#f3f4f6" strokeWidth="16" strokeLinecap="round" />
                        <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#5B5CE2" strokeWidth="16" strokeLinecap="round"
                          strokeDasharray={`${2.2 * occupancyPct} 220`} style={{ transition: 'stroke-dasharray 1s ease' }} />
                      </svg>
                      <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a2e', lineHeight: 1 }}>{occupancyPct}%</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Occupied</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {[
                      { label: 'Total', value: stats.totalRooms, color: '#6366f1' },
                      { label: 'Occupied', value: stats.totalRooms - stats.availableRooms, color: '#ef4444' },
                      { label: 'Available', value: stats.availableRooms, color: '#10b981' },
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                        <p style={{ fontSize: '20px', fontWeight: '800', color: item.color }}>{item.value}</p>
                        <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚡</span> Quick Actions
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {quickActions.map((a, i) => (
                      <button key={i} onClick={() => navigate(a.path)} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: `${a.color}10`, border: `1px solid ${a.color}25`,
                        borderRadius: '12px', padding: '12px 14px', cursor: 'pointer',
                        transition: 'all 0.2s', color: a.color, fontWeight: '600', fontSize: '13px'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.color = a.color; }}
                      >
                        <span style={{ fontSize: '18px' }}>{a.icon}</span> {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Priority Alerts */}
              {(stats.pendingApplications > 0 || stats.openMaintenance > 0) && (
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🚨</span> Action Required
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stats.pendingApplications > 0 && (
                      <div onClick={() => navigate('/admin/applications')} style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 18px', background: '#fef3c7', borderRadius: '12px',
                        cursor: 'pointer', border: '1px solid #fde68a', transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fde68a'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fef3c7'}
                      >
                        <span style={{ fontSize: '24px' }}>📋</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '700', color: '#92400e', fontSize: '14px' }}>
                            {stats.pendingApplications} Pending Application{stats.pendingApplications !== 1 ? 's' : ''}
                          </p>
                          <p style={{ fontSize: '12px', color: '#b45309' }}>Students are waiting for room assignment</p>
                        </div>
                        <span style={{ color: '#b45309', fontWeight: '700', fontSize: '18px' }}>→</span>
                      </div>
                    )}
                    {stats.openMaintenance > 0 && (
                      <div onClick={() => navigate('/admin/maintenance')} style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 18px', background: '#fef2f2', borderRadius: '12px',
                        cursor: 'pointer', border: '1px solid #fecaca', transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                      >
                        <span style={{ fontSize: '24px' }}>🔧</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                            {stats.openMaintenance} Open Maintenance Request{stats.openMaintenance !== 1 ? 's' : ''}
                          </p>
                          <p style={{ fontSize: '12px', color: '#b91c1c' }}>Requires immediate attention</p>
                        </div>
                        <span style={{ color: '#b91c1c', fontWeight: '700', fontSize: '18px' }}>→</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Overview */}
              <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📈</span> System Overview
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  {[
                    { label: 'Student Occupancy', value: stats.activeAssignments, max: stats.totalStudents, color: '#5B5CE2' },
                    { label: 'Room Utilization', value: stats.totalRooms - stats.availableRooms, max: stats.totalRooms, color: '#10b981' },
                  ].map((bar, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{bar.label}</span>
                        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>{bar.max > 0 ? Math.round((bar.value / bar.max) * 100) : 0}%</span>
                      </div>
                      <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', background: bar.color, borderRadius: '4px',
                          width: `${bar.max > 0 ? (bar.value / bar.max) * 100 : 0}%`,
                          transition: 'width 1s ease'
                        }} />
                      </div>
                      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{bar.value.toLocaleString()} of {bar.max.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminDashboard;
