import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { studentAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../styles/Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [assignment, setAssignment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [penalties, setPenalties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setStudentInfo(userData);
        
        if (user?.id) {
          try {
            const [assignmentRes, paymentsRes] = await Promise.all([
              studentAPI.getAssignment(user.id),
              studentAPI.getPayments(user.id),
            ]);
            setAssignment(assignmentRes.assignment);
            setPayments(paymentsRes.payments || []);
            
            // Fetch penalties
            const token = localStorage.getItem('token');
            const penaltiesRes = await fetch('http://localhost:5000/api/student/penalties', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const penaltiesData = await penaltiesRes.json();
            if (penaltiesData.success) {
              setPenalties(penaltiesData.penalties);
            }
          } catch (err) {
            console.log('No data yet');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const studentName = studentInfo?.firstName || user?.firstName || user?.first_name || 'Student';
  
  // Calculate stats
  const totalPenalties = penalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
  const unpaidPenalties = penalties.filter(p => p.status !== 'paid').reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
  const paidPenalties = penalties.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);

  const stats = [
    { label: t('currentRoom') || 'Room Status', value: assignment ? t('assigned') || 'Assigned' : t('notAssigned') || 'Not Assigned', icon: '🏠', color: '#667eea', bg: '#eef2ff' },
    { label: t('totalPenalties') || 'Total Penalties', value: `ETB ${totalPenalties.toFixed(2)}`, icon: '💰', color: '#e94560', bg: '#fef2f2' },
    { label: t('unpaid') || 'Unpaid', value: `ETB ${unpaidPenalties.toFixed(2)}`, icon: '⚠️', color: '#f59e0b', bg: '#fffbeb' },
    { label: t('paid') || 'Paid', value: `ETB ${paidPenalties.toFixed(2)}`, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
  ];

  const quickActions = [
    { label: t('browseRooms') || 'Browse Rooms', icon: '🏘️', path: '/student/rooms', color: '#667eea' },
    { label: t('myApplications') || 'My Applications', icon: '📝', path: '/student/applications', color: '#e94560' },
    { label: t('maintenanceRequests') || 'Maintenance', icon: '🔧', path: '/student/maintenance', color: '#f59e0b' },
    { label: t('profile') || 'My Profile', icon: '👤', path: '/student/profile', color: '#10b981' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar role="student" />
        <main style={{ 
          flex: 1, 
          padding: '30px', 
          overflowY: 'auto',
          background: '#f0f4f8',
          height: 'calc(100vh - 60px)'
        }}>
          
          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>{t('welcome')} {studentName}! 👋</h1>
              <p style={{ opacity: 0.9 }}>{t('welcomeMessage') || 'Welcome to your dormitory dashboard.'}</p>
            </div>
            <div style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-20px',
              fontSize: '120px',
              opacity: 0.1,
              zIndex: 1
            }}>🏛️</div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: stat.bg,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ color: '#718096', fontSize: '13px', marginBottom: '5px' }}>{stat.label}</p>
                  <h3 style={{ color: stat.color, fontSize: '20px', margin: 0, fontWeight: 'bold' }}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>{t('loading')}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px' }}>
              
              {/* Room Assignment Card */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '25px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '18px', color: '#1a1a2e', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏠</span> {t('currentRoom')}
                  </h2>
                  {assignment && <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{t('active')}</span>}
                </div>
                
                {assignment ? (
                  <div>
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '16px',
                      padding: '20px',
                      marginBottom: '15px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>{t('roomNumber')}</p>
                          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>{assignment.room_number}</p>
                        </div>
                        <div>
                          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>{t('building')}</p>
                          <p style={{ fontSize: '16px', fontWeight: '500', color: '#1e293b' }}>{assignment.building}</p>
                        </div>
                        <div>
                          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>{t('floor')}</p>
                          <p style={{ fontSize: '16px', fontWeight: '500', color: '#1e293b' }}>{assignment.floor}</p>
                        </div>
                        <div>
                          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>{t('roomType')}</p>
                          <p style={{ fontSize: '16px', fontWeight: '500', color: '#1e293b' }}>{t(assignment.room_type) || assignment.room_type}</p>
                        </div>
                      </div>
                    </div>
                    <a href="/student/assignment" style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px',
                      background: '#667eea',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontWeight: '500',
                      transition: 'background 0.2s'
                    }}>
                      {t('viewDetails') || 'View Room Details'} →
                    </a>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{t('noAssignment') || "You don't have a room assignment yet."}</p>
                    <a href="/student/rooms" style={{
                      display: 'inline-block',
                      background: '#667eea',
                      color: 'white',
                      padding: '12px 25px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>{t('browseRooms')} →</a>
                  </div>
                )}
              </div>

              {/* Penalties Card */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '25px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚠️</span> {t('recentPenalties') || 'Recent Penalties'}
                </h2>
                
                {penalties.length > 0 ? (
                  <div>
                    {penalties.slice(0, 3).map(penalty => (
                      <div key={penalty.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <div>
                          <p style={{ fontWeight: '500', color: '#1e293b' }}>{penalty.penalty_reason?.substring(0, 40)}...</p>
                          <p style={{ fontSize: '11px', color: '#94a3b8' }}>{t('dueDate')}: {new Date(penalty.due_date).toLocaleDateString()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 'bold', color: '#e94560' }}>ETB {parseFloat(penalty.penalty_amount).toFixed(2)}</p>
                          <span style={{
                            background: penalty.status === 'paid' ? '#10b981' : '#f59e0b',
                            color: 'white',
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '10px',
                            fontWeight: '500'
                          }}>
                            {penalty.status === 'paid' ? t('paid') : t('unpaid')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {penalties.length > 3 && (
                      <a href="/student/notifications" style={{
                        display: 'block',
                        textAlign: 'center',
                        marginTop: '15px',
                        color: '#667eea',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>{t('viewAll') || 'View All'} →</a>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px' }}>
                    <p style={{ color: '#94a3b8' }}>{t('noPenalties') || 'No penalties recorded.'}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>{t('keepGoodWork') || 'Keep up the good work!'} ✨</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions Section */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '25px',
            marginTop: '25px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> {t('quickActions')}
            </h2>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {quickActions.map((action, index) => (
                <a key={index} href={action.path} style={{
                  background: `${action.color}10`,
                  color: action.color,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  border: `1px solid ${action.color}20`
                }}>
                  <span style={{ fontSize: '18px' }}>{action.icon}</span>
                  {action.label}
                </a>
              ))}
            </div>
          </div>

          {/* Announcement Section */}
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
            borderRadius: '20px',
            padding: '20px 25px',
            marginTop: '25px',
            border: '1px solid #fecaca'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px'}}>📢</span>
              <div>
                <h3 style={{ fontSize: '16px', color: '#dc2626', marginBottom: '5px' }}>{t('announcements')}</h3>
                <p style={{ fontSize: '14px', color: '#78350f' }}>{t('announcementText') || 'Maintenance will be conducted on Building A this Saturday from 9 AM to 5 PM.'}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;