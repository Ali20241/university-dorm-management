import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import '../styles/Navbar.css';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notificationRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentProfile();
      fetchRealNotifications();
    } else if (user?.role === 'admin') {
      fetchAdminProfile();
      fetchAdminNotifications();
    } else {
      setUserName(user?.email?.split('@')[0] || 'User');
    }
    
    // Set up polling for real-time notifications (every 30 seconds)
    const interval = setInterval(() => {
      if (user?.role === 'student') {
        fetchRealNotifications();
      } else if (user?.role === 'admin') {
        fetchAdminNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/student/profile/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProfileImage(response.data.profile.profile_image);
        setUserName(response.data.profile.first_name);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      setUserName(user?.firstName || user?.email?.split('@')[0] || 'Student');
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/admin/profile/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProfileImage(response.data.profile.profile_image);
        setUserName(response.data.profile.first_name || response.data.profile.email?.split('@')[0] || 'Admin');
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setUserName(user?.email?.split('@')[0] || 'Admin');
    }
  };

  // Fetch real notifications for students
  const fetchRealNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get pending applications status
      const applicationsRes = await axios.get('http://localhost:5001/api/student/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get maintenance requests
      const maintenanceRes = await axios.get('http://localhost:5001/api/student/maintenance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get penalties
      const penaltiesRes = await axios.get('http://localhost:5001/api/student/penalties', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newNotifications = [];
      
      // Check pending applications
      const pendingApps = applicationsRes.data.applications?.filter(a => a.status === 'pending') || [];
      if (pendingApps.length > 0) {
        newNotifications.push({
          id: 'pending_apps',
          text: `${pendingApps.length} room application(s) pending review`,
          time: 'Just now',
          read: false,
          type: 'application',
          link: '/student/applications'
        });
      }
      
      // Check approved applications
      const approvedApps = applicationsRes.data.applications?.filter(a => a.status === 'approved') || [];
      if (approvedApps.length > 0) {
        newNotifications.push({
          id: 'approved_apps',
          text: `${approvedApps.length} application(s) have been approved!`,
          time: 'Just now',
          read: false,
          type: 'application',
          link: '/student/assignment'
        });
      }
      
      // Check rejected applications
      const rejectedApps = applicationsRes.data.applications?.filter(a => a.status === 'rejected') || [];
      if (rejectedApps.length > 0) {
        newNotifications.push({
          id: 'rejected_apps',
          text: `${rejectedApps.length} application(s) were rejected`,
          time: 'Just now',
          read: false,
          type: 'application',
          link: '/student/applications'
        });
      }
      
      // Check open maintenance requests
      const openMaintenance = maintenanceRes.data.requests?.filter(r => r.status === 'open') || [];
      if (openMaintenance.length > 0) {
        newNotifications.push({
          id: 'open_maintenance',
          text: `${openMaintenance.length} maintenance request(s) are open`,
          time: 'Just now',
          read: false,
          type: 'maintenance',
          link: '/student/maintenance'
        });
      }
      
      // Check completed maintenance
      const completedMaintenance = maintenanceRes.data.requests?.filter(r => r.status === 'completed') || [];
      if (completedMaintenance.length > 0) {
        newNotifications.push({
          id: 'completed_maintenance',
          text: `${completedMaintenance.length} maintenance request(s) have been completed`,
          time: 'Just now',
          read: false,
          type: 'maintenance',
          link: '/student/maintenance'
        });
      }
      
      // Check unpaid penalties
      const unpaidPenalties = penaltiesRes.data.penalties?.filter(p => p.status !== 'paid') || [];
      if (unpaidPenalties.length > 0) {
        const totalAmount = unpaidPenalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount), 0);
        newNotifications.push({
          id: 'unpaid_penalties',
          text: `You have ${unpaidPenalties.length} unpaid penalty(ies) totaling ETB ${totalAmount.toFixed(2)}`,
          time: 'Just now',
          read: false,
          type: 'penalty',
          link: '/student/payments'
        });
      }
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch notifications for admin
  const fetchAdminNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [applicationsRes, maintenanceRes, penaltiesRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/applications', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5001/api/admin/maintenance', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5001/api/admin/penalties', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const newNotifications = [];
      
      const pendingApps = applicationsRes.data.applications?.filter(a => a.status === 'pending') || [];
      if (pendingApps.length > 0) {
        newNotifications.push({
          id: 'admin_pending_apps',
          text: `${pendingApps.length} pending room application(s) need review`,
          time: 'Just now',
          read: false,
          type: 'application',
          link: '/admin/applications'
        });
      }
      
      const openMaintenance = maintenanceRes.data.requests?.filter(r => r.status === 'open') || [];
      if (openMaintenance.length > 0) {
        newNotifications.push({
          id: 'admin_open_maintenance',
          text: `${openMaintenance.length} open maintenance request(s)`,
          time: 'Just now',
          read: false,
          type: 'maintenance',
          link: '/admin/maintenance'
        });
      }
      
      const unpaidPenalties = penaltiesRes.data.penalties?.filter(p => p.status !== 'paid') || [];
      if (unpaidPenalties.length > 0) {
        newNotifications.push({
          id: 'admin_unpaid_penalties',
          text: `${unpaidPenalties.length} unpaid penalty(ies)`,
          time: 'Just now',
          read: false,
          type: 'penalty',
          link: '/admin/penalties'
        });
      }
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (userName) return userName.charAt(0).toUpperCase();
    return '👤';
  };

  const goToProfile = () => {
    if (user?.role === 'admin') {
      navigate('/admin/profile');
    } else if (user?.role === 'student') {
      navigate('/student/profile');
    }
    setShowDropdown(false);
    setShowNotifications(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
    setShowNotifications(false);
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowDropdown(false);
    // Mark all as read when opening
    if (!showNotifications) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = (link) => {
    setShowNotifications(false);
    navigate(link);
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'application': return '📋';
      case 'maintenance': return '🔧';
      case 'penalty': return '⚠️';
      default: return '🔔';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏛️ {t('appTitle')}
        </Link>
        <div className="navbar-right">
  <ThemeToggle />
  {/* rest of navbar items */}
</div>
        
        <div className="navbar-right">
          {/* Notification Bell */}
          <div ref={notificationRef} style={{ position: 'relative' }}>
            <button className="notification-btn" onClick={toggleNotifications}>
              <span className="notification-icon">🔔</span>
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <strong>Notifications</strong>
                  {notifications.length === 0 && <span style={{ fontSize: '12px', color: '#6B7280' }}>No new notifications</span>}
                </div>
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div 
                      key={index} 
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif.link)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{getNotificationIcon(notif.type)}</span>
                        <div style={{ flex: 1 }}>
                          <p>{notif.text}</p>
                          <small>{notif.time}</small>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notification-item" style={{ textAlign: 'center' }}>
                    <p>✨ All caught up!</p>
                    <small>No new notifications</small>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <span className="user-greeting">
            {t('hi')}, {userName}! 👋
          </span>
          
          <div ref={dropdownRef} className="profile-circle-container">
            <div className="profile-circle" onClick={goToProfile}>
              {profileImage ? (
                <img 
                  src={`http://localhost:5001${profileImage}`} 
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <span className="profile-initials">{getInitials()}</span>
              )}
            </div>
            
            <button className="dropdown-arrow" onClick={toggleDropdown}>
              ▼
            </button>
            
            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {profileImage ? (
                      <img src={`http://localhost:5001${profileImage}`} alt="Profile" />
                    ) : (
                      <span>{getInitials()}</span>
                    )}
                  </div>
                  <div className="dropdown-info">
                    <strong>{userName}</strong>
                    <small>{user?.email}</small>
                  </div>
                </div>
                
                <button onClick={goToProfile} className="dropdown-item">
                  👤 {t('profile')}
                </button>
                
                {user?.role === 'admin' && (
                  <Link to="/admin/change-password" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    🔐 {t('changePassword')}
                  </Link>
                )}
                
                {user?.role === 'student' && (
                  <Link to="/student/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    👤 {t('edit')} {t('profile')}
                  </Link>
                )}
                
                <hr className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  🚪 {t('logout')}
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