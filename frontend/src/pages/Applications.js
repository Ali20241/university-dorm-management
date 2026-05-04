import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchApplications(); }, []);

  useEffect(() => {
    let res = applications;
    if (statusFilter !== 'all') res = res.filter(a => a.status === statusFilter);
    if (search) res = res.filter(a =>
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      a.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      a.student_code?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(res);
  }, [search, statusFilter, applications]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/admin/applications', { headers: { Authorization: `Bearer ${token}` } });
      setApplications(res.applications || []);
    } catch (e) { showMsg('error', 'Failed to load applications'); }
    finally { setLoading(false); }
  };

  const showMsg = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000); };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/applications/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showMsg('success', '✅ Application approved and room assigned!');
      fetchApplications();
    } catch (e) { showMsg('error', e.response?.data?.message || 'Failed to approve'); }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/applications/${rejectModal}/reject`, { reason: rejectReason }, { headers: { Authorization: `Bearer ${token}` } });
      showMsg('success', 'Application rejected.');
      setRejectModal(null);
      setRejectReason('');
      fetchApplications();
    } catch (e) { showMsg('error', 'Failed to reject'); }
  };

  const counts = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const statusStyle = (s) => {
    switch (s) {
      case 'approved': return { bg: '#d1fae5', color: '#065f46', icon: '✅' };
      case 'rejected': return { bg: '#fee2e2', color: '#991b1b', icon: '❌' };
      default: return { bg: '#fef3c7', color: '#92400e', icon: '⏳' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>📋 Room Applications</h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Review and manage student room applications</p>
          </div>

          {message && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '13px', fontWeight: '500', background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`, display: 'flex', gap: '8px', alignItems: 'center' }}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total', value: counts.total, icon: '📋', color: '#5B5CE2', bg: '#eef0ff' },
              { label: 'Pending', value: counts.pending, icon: '⏳', color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Approved', value: counts.approved, icon: '✅', color: '#10b981', bg: '#d1fae5' },
              { label: 'Rejected', value: counts.rejected, icon: '❌', color: '#ef4444', bg: '#fee2e2' },
            ].map((c, i) => (
              <div key={i} onClick={() => setStatusFilter(c.label.toLowerCase() === 'total' ? 'all' : c.label.toLowerCase())}
                style={{ background: 'white', borderRadius: '14px', padding: '16px', border: `2px solid ${statusFilter === (c.label.toLowerCase() === 'total' ? 'all' : c.label.toLowerCase()) ? c.color : '#e5e7eb'}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ width: '44px', height: '44px', background: c.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{c.icon}</div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '800', color: c.color }}>{c.value}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
              <input placeholder="Search students or rooms..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white' }}
                onFocus={e => e.target.style.borderColor = '#5B5CE2'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{filtered.length} application{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#5B5CE2', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#6b7280' }}>Loading applications...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>No applications found</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Student', 'Student ID', 'Room', 'Applied On', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a, i) => {
                      const ss = statusStyle(a.status);
                      return (
                        <tr key={a.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg, hsl(${i * 53 % 360},60%,60%), hsl(${(i * 53 + 40) % 360},70%,50%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                                {a.first_name?.charAt(0)}
                              </div>
                              <div>
                                <p style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '13px' }}>{a.first_name} {a.last_name}</p>
                                <p style={{ fontSize: '11px', color: '#9ca3af' }}>{a.building}, Floor {a.floor}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <span style={{ color: '#5B5CE2', fontWeight: '600', fontSize: '13px' }}>{a.student_code || '—'}</span>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <p style={{ fontWeight: '700', fontSize: '15px', color: '#1a1a2e' }}>Room {a.room_number}</p>
                            <p style={{ fontSize: '11px', color: '#9ca3af' }}>{a.room_type} • Cap: {a.capacity || '?'}</p>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb', color: '#6b7280', fontSize: '13px' }}>
                            {new Date(a.application_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <span style={{ background: ss.bg, color: ss.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                              {ss.icon} {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            {a.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleApprove(a.id)} style={{ padding: '6px 14px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', transition: 'all 0.2s' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = '#d1fae5'; e.currentTarget.style.color = '#065f46'; }}>
                                  ✅ Approve
                                </button>
                                <button onClick={() => { setRejectModal(a.id); setRejectReason(''); }} style={{ padding: '6px 14px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', transition: 'all 0.2s' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#991b1b'; }}>
                                  ❌ Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '440px', maxWidth: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a2e', marginBottom: '6px' }}>❌ Reject Application</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Please provide a reason for rejection (optional).</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
              placeholder="e.g. Room already assigned, eligibility criteria not met..."
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', resize: 'vertical', marginBottom: '20px', fontFamily: 'Inter, sans-serif' }}
              onFocus={e => e.target.style.borderColor = '#5B5CE2'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '11px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleReject} style={{ flex: 1, padding: '11px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Applications;
