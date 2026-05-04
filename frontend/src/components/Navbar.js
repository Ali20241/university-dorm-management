import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import api from '../services/api';
import ThemeToggle from './ThemeToggle';
import '../styles/Navbar.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileInitials, setProfileInitials] = useState('U');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (user?.role === 'admin') {
        const res = await api.get('/admin/profile/details', { headers: { Authorization: `Bearer ${token}` } });
        const name = res.profile?.email?.split('@')[0] || 'Admin';
        setProfileName(name);
        setProfileInitials(name.charAt(0).toUpperCase());
      } else {
        const res = await api.get('/student/profile', { headers: { Authorization: `Bearer ${token}` } });
        const s = res.student;
        const name = `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Student';
        setProfileName(name);
        setProfileInitials((s.first_name?.charAt(0) || 'S').toUpperCase());
        if (s.profile_image) setProfileImage(`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001'}${s.profile_image}`);
      }
    } catch (e) {
      setProfileName(user?.email?.split('@')[0] || 'User');
      setProfileInitials((user?.email?.charAt(0) || 'U').toUpperCase());
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (user?.role === 'student') {
        const res = await api.get('/student/notifications', { headers: { Authorization: `Bearer ${token}` } });
        const apps = (res.applications || []).slice(0, 3).map(a => ({
          id: `app-${a.id}`, icon: '📋',
          message: `Room application for ${a.room_number} — ${a.status}`,
          time: new Date(a.application_date).toLocaleDateString(), unread: a.status === 'pending'
        }));
        const maint = (res.maintenance || []).slice(0, 2).map(m => ({
          id: `maint-${m.id}`, icon: '🔧',
          message: `Maintenance: ${m.title} — ${m.status}`,
          time: new Date(m.created_at).toLocaleDateString(), unread: m.status === 'open'
        }));
        const pens = (res.penalties || []).filter(p => p.status !== 'paid').slice(0, 2).map(p => ({
          id: `pen-${p.id}`, icon: '⚠️',
          message: `Penalty: ETB ${p.penalty_amount} — ${p.penalty_type}`,
          time: new Date(p.issued_date).toLocaleDateString(), unread: true
        }));
        const all = [...apps, ...maint, ...pens];
        setNotifications(all);
        setUnreadCount(all.filter(n => n.unread).length);
      } else {
        const res = await api.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
        const s = res.statistics || {};
        const items = [];
        if (s.pendingApplications > 0) items.push({ id: 'pending', icon: '📋', message: `${s.pendingApplications} pending application(s) awaiting review`, unread: true });
        if (s.openMaintenance > 0) items.push({ id: 'maint', icon: '🔧', message: `${s.openMaintenance} open maintenance request(s)`, unread: true });
        setNotifications(items);
        setUnreadCount(items.filter(n => n.unread).length);
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="navbar-logo">
          <div className="navbar-logo-icon">🏛️</div>
          <span>DormHub</span>
        </Link>

        <div className="navbar-right">
          <ThemeToggle />

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button className="notification-btn" onClick={() => { setShowNotifications(!showNotifications); setShowDropdown(false); }}>
              <span className="notification-icon">🔔</span>
              {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <strong>🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}</strong>
                  {unreadCount > 0 && <button className="mark-all-read" onClick={() => { setUnreadCount(0); setNotifications(prev => prev.map(n => ({ ...n, unread: false }))); }}>Mark all read</button>}
                </div>
                {notifications.length === 0 ? (
                  <div className="notifications-empty">
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                    <p>You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                      <p><span style={{ marginRight: '6px' }}>{n.icon}</span>{n.message}</p>
                      {n.time && <small>{n.time}</small>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Greeting */}
          <span className="user-greeting">
            Hello, {profileName || user?.email?.split('@')[0] || 'User'} 👋
          </span>

          {/* Profile */}
          <div ref={dropdownRef} className="profile-circle-container">
            <div className="profile-circle" onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-avatar" />
              ) : (
                <span className="profile-initials">{profileInitials}</span>
              )}
            </div>
            <button className={`dropdown-arrow ${showDropdown ? 'open' : ''}`} onClick={() => setShowDropdown(!showDropdown)}>▼</button>

            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {profileImage ? <img src={profileImage} alt="Profile" /> : <span>{profileInitials}</span>}
                  </div>
                  <div className="dropdown-info">
                    <strong>{profileName || 'User'}</strong>
                    <small>{user?.email}</small>
                    <span className="role-chip">{user?.role || 'user'}</span>
                  </div>
                </div>

                {user?.role === 'admin' ? (
                  <>
                    <Link to="/admin/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span className="item-icon">⚙️</span> Settings
                    </Link>
                    <Link to="/admin/change-password" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span className="item-icon">🔐</span> Change Password
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/student/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span className="item-icon">👤</span> My Profile
                    </Link>
                    <Link to="/student/notifications" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span className="item-icon">🔔</span> Notifications
                      {unreadCount > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: '700' }}>{unreadCount}</span>}
                    </Link>
                  </>
                )}

                <hr className="dropdown-divider" />
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  <span className="item-icon">🚪</span> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
