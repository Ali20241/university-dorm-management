import api from '../services/api';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import OccupancyChart from '../components/OccupancyChart';
import ApplicationStatusChart from '../components/ApplicationStatusChart';
import MaintenanceChart from '../components/MaintenanceChart';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    availableRooms: 0,
    pendingApplications: 0,
    openMaintenance: 0
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data.statistics);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: '👥', color: '#667eea', bg: '#eef2ff', trend: '+12%', trendUp: true },
    { title: 'Total Rooms', value: stats.totalRooms, icon: '🏠', color: '#10b981', bg: '#ecfdf5', trend: '+5%', trendUp: true },
    { title: 'Available Rooms', value: stats.availableRooms, icon: '✅', color: '#f59e0b', bg: '#fffbeb', trend: '-3%', trendUp: false },
    { title: 'Pending Applications', value: stats.pendingApplications, icon: '📋', color: '#8b5cf6', bg: '#f5f3ff', trend: '+8%', trendUp: true },
    { title: 'Open Maintenance', value: stats.openMaintenance, icon: '🔧', color: '#ef4444', bg: '#fef2f2', trend: '-2%', trendUp: false }
  ];

  const quickActions = [
    { label: 'Students', path: '/admin/students', icon: '👥', color: '#667eea' },
    { label: 'Rooms', path: '/admin/rooms', icon: '🏠', color: '#10b981' },
    { label: 'Applications', path: '/admin/applications', icon: '📋', color: '#8b5cf6' },
    { label: 'Maintenance', path: '/admin/maintenance', icon: '🔧', color: '#f59e0b' },
    { label: 'Penalties', path: '/admin/penalties', icon: '⚠️', color: '#ef4444' },
    { label: 'Reports', path: '/admin/reports', icon: '📊', color: '#06b6d4' },
    { label: 'Bulk Rooms', path: '/admin/bulk-rooms', icon: '🏢', color: '#ec4899' },
  ];

  const recentActivities = [
    { icon: '👤', action: 'New student registered - Sarah Johnson', time: '5 minutes ago', color: '#667eea' },
    { icon: '🏠', action: 'Room A101 assigned to John Doe', time: '1 hour ago', color: '#10b981' },
    { icon: '📋', action: 'Application #1234 approved', time: '3 hours ago', color: '#8b5cf6' },
    { icon: '🔧', action: 'Maintenance request #567 completed', time: '5 hours ago', color: '#f59e0b' },
    { icon: '⚠️', action: 'Penalty issued to student', time: 'Yesterday', color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f5f7fa' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar role="admin" />
        <main style={{ 
          flex: 1, 
          padding: '28px', 
          overflowY: 'auto',
          background: '#f5f7fa',
          height: 'calc(100vh - 60px)'
        }}>
          
          {/* Welcome Section */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '28px 32px',
            marginBottom: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                  {greeting}, {user?.email?.split('@')[0]}! 👋
                </h1>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Welcome to your admin dashboard. Here's what's happening today.
                </p>
              </div>
              <div style={{
                background: '#f3f4f6',
                padding: '8px 16px',
                borderRadius: '40px',
                fontSize: '13px',
                color: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🕐</span> {currentTime}
                <span style={{ width: '1px', height: '20px', background: '#d1d5db', margin: '0 4px' }} />
                <span>📅</span> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#667eea', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '28px'
              }}>
                {statCards.map((card, index) => (
                  <div key={index} style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        background: card.bg,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '26px'
                      }}>
                        {card.icon}
                      </div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: card.trendUp ? '#10b981' : '#ef4444',
                        background: card.trendUp ? '#ecfdf5' : '#fef2f2',
                        padding: '4px 10px',
                        borderRadius: '20px'
                      }}>
                        {card.trend} {card.trendUp ? '↑' : '↓'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>{card.value}</h3>
                    <p style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>{card.title}</p>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: card.color,
                      borderRadius: '0 0 20px 20px'
                    }} />
                  </div>
                ))}
              </div>

              {/* Charts Section - 2 columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: '24px',
                marginBottom: '28px'
              }}>
                {/* Occupancy Chart */}
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '20px' }}>📊</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>Room Occupancy</h3>
                  </div>
                  <OccupancyChart 
                    availableRooms={stats.availableRooms}
                    occupiedRooms={stats.totalRooms - stats.availableRooms}
                    maintenanceRooms={0}
                  />
                </div>
                
                {/* Applications Chart */}
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '20px' }}>📝</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>Applications Status</h3>
                  </div>
                  <ApplicationStatusChart 
                    pending={stats.pendingApplications}
                    approved={12}
                    rejected={3}
                  />
                </div>
              </div>

              {/* Third Row - Maintenance Chart full width */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                marginBottom: '28px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '20px' }}>🔧</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>Maintenance Requests Overview</h3>
                </div>
                <MaintenanceChart 
                  open={stats.openMaintenance}
                  inProgress={4}
                  completed={18}
                />
              </div>

              {/* Quick Actions & Recent Activity - Two columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '24px'
              }}>
                {/* Quick Actions */}
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '20px' }}>⚡</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>Quick Actions</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => navigate(action.path)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px 20px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          width: '100%'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = action.color;
                          e.currentTarget.style.borderColor = action.color;
                          e.currentTarget.style.color = 'white';
                          const spans = e.currentTarget.querySelectorAll('span');
                          spans.forEach(span => span.style.color = 'white');
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f9fafb';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.color = '#1a1a2e';
                          const spans = e.currentTarget.querySelectorAll('span');
                          spans.forEach(span => span.style.color = '#1a1a2e');
                        }}
                      >
                        <span style={{ fontSize: '18px', transition: 'color 0.2s' }}>{action.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '20px' }}>🔄</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>Recent Activity</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {recentActivities.map((activity, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        paddingBottom: idx < recentActivities.length - 1 ? '12px' : 0,
                        borderBottom: idx < recentActivities.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: `${activity.color}10`,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          {activity.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#1a1a2e', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{activity.action}</p>
                          <p style={{ color: '#9ca3af', fontSize: '11px' }}>{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;