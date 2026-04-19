import api from '../services/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../context/LanguageContext';

const StudentNotifications = () => {
  const { t } = useLanguage();
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/student/penalties', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPenalties(response.data.penalties);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPenaltyTypeIcon = (type) => {
    switch(type) {
      case 'damage': return '💔';
      case 'rule_violation': return '📜';
      case 'late_fee': return '⏰';
      default: return '⚠️';
    }
  };

  const getPenaltyTypeLabel = (type) => {
    switch(type) {
      case 'damage': return 'Property Damage';
      case 'rule_violation': return 'Rule Violation';
      case 'late_fee': return 'Late Fee';
      default: return 'Other';
    }
  };

  const totalUnpaid = penalties.filter(p => p.status !== 'paid').reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
  const totalPaid = penalties.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="student" />
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '5px' }}>🔔 {t('notifications') || 'Notifications & Penalties'}</h1>
            <p style={{ color: '#718096' }}>{t('viewPenalties') || 'View your penalty history and notifications'}</p>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#f56565', fontSize: '12px' }}>{t('totalUnpaid') || 'Total Unpaid Penalties'}</p>
              <h2 style={{ fontSize: '28px', color: '#f56565' }}>ETB {totalUnpaid.toFixed(2)}</h2>
            </div>
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#48bb78', fontSize: '12px' }}>{t('totalPaid') || 'Total Paid'}</p>
              <h2 style={{ fontSize: '28px', color: '#48bb78' }}>ETB {totalPaid.toFixed(2)}</h2>
            </div>
            <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#667eea', fontSize: '12px' }}>{t('totalPenalties') || 'Total Penalties'}</p>
              <h2 style={{ fontSize: '28px', color: '#667eea' }}>{penalties.length}</h2>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>{t('loading') || 'Loading...'}</div>
          ) : penalties.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '15px', padding: '50px', textAlign: 'center' }}>
              <span style={{ fontSize: '48px' }}>✅</span>
              <p style={{ marginTop: '15px' }}>{t('noPenalties') || 'No penalties! Keep up the good work!'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {penalties.map(penalty => (
                <div key={penalty.id} style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  borderLeft: penalty.status !== 'paid' ? '4px solid #f56565' : '4px solid #48bb78'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{getPenaltyTypeIcon(penalty.penalty_type)}</span>
                        <h3 style={{ margin: 0 }}>{getPenaltyTypeLabel(penalty.penalty_type)}</h3>
                        {penalty.status !== 'paid' && (
                          <span style={{
                            background: '#fed7d7',
                            color: '#742a2a',
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '11px'
                          }}>{t('unpaid') || 'Unpaid'}</span>
                        )}
                        {penalty.status === 'paid' && (
                          <span style={{
                            background: '#c6f6d5',
                            color: '#22543d',
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '11px'
                          }}>{t('paid') || 'Paid'}</span>
                        )}
                      </div>
                      <p><strong>{t('reason') || 'Reason'}:</strong> {penalty.penalty_reason}</p>
                      {penalty.notes && <p><strong>{t('notes') || 'Notes'}:</strong> {penalty.notes}</p>}
                      <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '10px' }}>
                        {t('issued') || 'Issued'}: {new Date(penalty.issued_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#e94560' }}>ETB {parseFloat(penalty.penalty_amount).toFixed(2)}</p>
                      <p style={{ fontSize: '12px', color: '#a0aec0' }}>{t('dueDate') || 'Due'}: {new Date(penalty.due_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentNotifications;