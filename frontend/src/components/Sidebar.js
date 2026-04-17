import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/Sidebar.css';

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const studentMenu = [
    { label: 'Dashboard', path: '/student/dashboard', icon: '🏠' },
    { label: 'Available Rooms', path: '/student/rooms', icon: '🏘️' },
    { label: 'My Applications', path: '/student/applications', icon: '📝' },
    { label: 'My Assignment', path: '/student/assignment', icon: '🏠' },
    { label: 'Swap Room', path: '/student/swap-request', icon: '🔄' },
    { label: 'Payments', path: '/student/payments', icon: '💰' },
    { label: 'Maintenance Requests', path: '/student/maintenance', icon: '🔧' },
    { label: 'Notifications', path: '/student/notifications', icon: '🔔' },
  ];

    const adminMenu = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Students', path: '/admin/students', icon: '👥' },
  { label: 'Rooms', path: '/admin/rooms', icon: '🏠' },
  { label: 'Bulk Rooms', path: '/admin/bulk-rooms', icon: '🏢' },
  { label: 'Applications', path: '/admin/applications', icon: '📋' },
  { label: 'Room Assignments', path: '/admin/room-assignments-report', icon: '📋' },
  { label: 'Attendance', path: '/admin/attendance', icon: '📋' },  // ← ADD THIS LINE
  { label: 'Maintenance', path: '/admin/maintenance', icon: '🔧' },
  { label: 'Penalties', path: '/admin/penalties', icon: '⚠️' },
  { label: 'Payments', path: '/admin/payments', icon: '💰' },
  { label: 'Reports', path: '/admin/reports', icon: '📊' },
  { label: 'Settings', path: '/admin/profile', icon: '⚙️' },
  { label: 'Bulk Import', path: '/admin/bulk-import', icon: '📤' },
];
  

  const menuItems = role === 'admin' ? adminMenu : studentMenu;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    localStorage.setItem('sidebarCollapsed', !isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Load saved state on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
        ☰
      </button>
      
      <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Toggle Button for Desktop */}
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? '▶' : '◀'}
        </button>
        
        {/* Close button for mobile */}
        <button className="sidebar-close-btn" onClick={toggleMobileSidebar}>
          ✕
        </button>

        <div className="sidebar-header">
          {!isCollapsed ? (
            <h2 className="sidebar-logo">🏛️ DormHub</h2>
          ) : (
            <div className="sidebar-logo-small">🏛️</div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        {/* Language Switcher at bottom of sidebar */}
        <div className="sidebar-footer">
          <LanguageSwitcher isCollapsed={isCollapsed} />
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={toggleMobileSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;