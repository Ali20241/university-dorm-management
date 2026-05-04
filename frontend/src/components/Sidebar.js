import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const studentMenu = [
    { label: 'Dashboard', path: '/student/dashboard', icon: '🏠' },
    { label: 'Available Rooms', path: '/student/rooms', icon: '🏘️' },
    { label: 'My Applications', path: '/student/applications', icon: '📝' },
    { label: 'My Assignment', path: '/student/assignment', icon: '🛏️' },
    { label: 'Swap Room', path: '/student/swap-request', icon: '🔄' },
    { label: 'Payments', path: '/student/payments', icon: '💰' },
    { label: 'Maintenance', path: '/student/maintenance', icon: '🔧' },
    { label: 'Notifications', path: '/student/notifications', icon: '🔔' },
    { label: 'My Profile', path: '/student/profile', icon: '👤' },
  ];

  const adminMenu = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊', section: 'main' },
    { label: 'Students', path: '/admin/students', icon: '👥', section: 'management' },
    { label: 'Manage Rooms', path: '/admin/rooms', icon: '🏠', section: 'management' },
    { label: 'Bulk Rooms', path: '/admin/bulk-rooms', icon: '🏢', section: 'management' },
    { label: 'Applications', path: '/admin/applications', icon: '📋', section: 'management' },
    { label: 'Room Assignments', path: '/admin/room-assignments-report', icon: '🗂️', section: 'management' },
    { label: 'Attendance', path: '/admin/attendance', icon: '✅', section: 'management' },
    { label: 'Maintenance', path: '/admin/maintenance', icon: '🔧', section: 'operations' },
    { label: 'Penalties', path: '/admin/penalties', icon: '⚠️', section: 'operations' },
    { label: 'Payments', path: '/admin/payments', icon: '💰', section: 'operations' },
    { label: 'Reports', path: '/admin/reports', icon: '📊', section: 'operations' },
    { label: 'Bulk Import', path: '/admin/bulk-import', icon: '📤', section: 'settings' },
    { label: 'Settings', path: '/admin/profile', icon: '⚙️', section: 'settings' },
  ];

  const menuItems = role === 'admin' ? adminMenu : studentMenu;

  React.useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      localStorage.setItem('sidebarCollapsed', !prev);
      return !prev;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Group admin menu by section
  const renderAdminMenu = () => {
    const sections = [
      { key: 'main', label: 'Overview' },
      { key: 'management', label: 'Management' },
      { key: 'operations', label: 'Operations' },
      { key: 'settings', label: 'Settings' },
    ];

    return sections.map(sec => {
      const items = adminMenu.filter(i => i.section === sec.key);
      if (!items.length) return null;
      return (
        <div key={sec.key}>
          {!isCollapsed && (
            <div style={{
              padding: '6px 16px 4px',
              fontSize: '10px',
              fontWeight: '700',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginTop: sec.key !== 'main' ? '8px' : '0'
            }}>{sec.label}</div>
          )}
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {!isCollapsed && isActive(item.path) && (
                <span style={{
                  marginLeft: 'auto', width: '6px', height: '6px',
                  background: '#5B5CE2', borderRadius: '50%', flexShrink: 0
                }} />
              )}
            </Link>
          ))}
        </div>
      );
    });
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(true)}>☰</button>

      <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Desktop collapse toggle */}
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? '▶' : '◀'}
        </button>

        {/* Mobile close */}
        <button className="sidebar-close-btn" onClick={() => setIsMobileOpen(false)}>✕</button>

        {/* Logo */}
        <div className="sidebar-header">
          {!isCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', background: 'linear-gradient(135deg, #5B5CE2, #7C3AED)',
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
              }}>🏛️</div>
              <div>
                <h2 className="sidebar-logo">DormHub</h2>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0, fontWeight: '500' }}>
                  {role === 'admin' ? 'Admin Panel' : 'Student Portal'}
                </p>
              </div>
            </div>
          ) : (
            <div className="sidebar-logo-small">🏛️</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" style={{ paddingTop: '4px' }}>
          {role === 'admin' ? renderAdminMenu() : studentMenu.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {!isCollapsed && isActive(item.path) && (
                <span style={{
                  marginLeft: 'auto', width: '6px', height: '6px',
                  background: '#5B5CE2', borderRadius: '50%', flexShrink: 0
                }} />
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {!isCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                padding: '10px 12px', borderRadius: '10px',
                background: 'rgba(91,92,226,0.08)',
                display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px'
              }}>
                <div style={{
                  width: '32px', height: '32px', background: 'linear-gradient(135deg, #5B5CE2, #7C3AED)',
                  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', flexShrink: 0
                }}>
                  {role === 'admin' ? '👨‍💼' : '🎓'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {role === 'admin' ? 'Administrator' : 'Student'}
                  </p>
                  <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'none', border: '1px solid #fecaca', color: '#ef4444',
                  borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '500', width: '100%', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '20px', padding: '8px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', transition: 'background 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              🚪
            </button>
          )}
        </div>
      </div>

      {isMobileOpen && <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />}
    </>
  );
};

export default Sidebar;
