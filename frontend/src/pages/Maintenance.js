import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notesModal, setNotesModal] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    let res = requests;
    if (priorityFilter !== 'all') res = res.filter(r => r.priority === priorityFilter);
    if (statusFilter !== 'all') res = res.filter(r => r.status === statusFilter);
    if (search) res = res.filter(r =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(res);
  }, [search, priorityFilter, statusFilter, requests]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/admin/maintenance', { headers: { Authorization: `Bearer ${token}` } });
      setRequests(res.requests || []);
    } catch (e) { showMsg('error', 'Failed to load maintenance requests'); }
    finally { setLoading(false); }
  };

  const showMsg = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000); };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/maintenance/${id}/status`, { status, notes }, { headers: { Authorization: `Bearer ${token}` } });
      showMsg('success', `Status updated to ${status}`);
      setNotesModal(null);
      setNotes('');
      fetchRequests();
    } catch (e) { showMsg('error', 'Failed to update status'); }
  };

  const priorityConfig = {
    emergency: { bg: '#fee2e2', color: '#991b1b', label: '🚨 Emergency', border: '#fca5a5' },
    high: { bg: '#fff7ed', color: '#9a3412', label: '🔴 High', border: '#fdba74' },
    medium: { bg: '#fefce8', color: '#854d0e', label: '🟡 Medium', border: '#fde047' },
    low: { bg: '#f0fdf4', color: '#166534', label: '🟢 Low', border: '#86efac' },
  };

  const statusConfig = {
    open: { bg: '#fff7ed', color: '#9a3412', label: 'Open' },
    in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
    completed: { bg: '#d1fae5', color: '#065f46', label: 'Completed' },
  };

  const counts = {
    open: requests.filter(r => r.status === 'open').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    emergency: requests.filter(r => r.priority === 'emergency').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>🔧 Maintenance Requests</h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Track and manage all maintenance requests</p>
          </div>

          {message && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '13px', fontWeight: '500', background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`, display: 'flex', gap: '8px', alignItems: 'center' }}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Open', value: counts.open, icon: '🔴', color: '#ef4444', bg: '#fee2e2' },
              { label: 'In Progress', value: counts.in_progress, icon: '🔵', color: '#3b82f6', bg: '#dbeafe' },
              { label: 'Completed', value: counts.completed, icon: '✅', color: '#10b981', bg: '#d1fae5' },
              { label: 'Emergency', value: counts.emergency, icon: '🚨', color: '#dc2626', bg: '#fef2f2' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
              <input placeholder="Search by title, room, student..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white' }}
                onFocus={e => e.target.style.borderColor = '#5B5CE2'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer' }}>
              <option value="all">All Priorities</option>
              <option value="emergency">Emergency</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer' }}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#5B5CE2', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#6b7280' }}>Loading requests...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔧</div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>No requests found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map(r => {
                const pc = priorityConfig[r.priority] || priorityConfig.low;
                const sc = statusConfig[r.status] || statusConfig.open;
                return (
                  <div key={r.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: `1px solid ${pc.border}`, borderLeft: `4px solid ${pc.border}`, transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>{r.title}</h3>
                          <span style={{ background: pc.bg, color: pc.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{pc.label}</span>
                          <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{sc.label}</span>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '10px', lineHeight: 1.5 }}>{r.description}</p>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>🏠 Room {r.room_number}</span>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>👤 {r.first_name} {r.last_name}</span>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>📅 {new Date(r.created_at).toLocaleDateString()}</span>
                          {r.completion_date && <span style={{ fontSize: '12px', color: '#10b981' }}>✅ Completed: {new Date(r.completion_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {r.status !== 'completed' && (
                          <>
                            {r.status === 'open' && (
                              <button onClick={() => handleStatusUpdate(r.id, 'in_progress')}
                                style={{ padding: '7px 14px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.color = '#1e40af'; }}>
                                🔵 Start
                              </button>
                            )}
                            <button onClick={() => { setNotesModal(r.id); setNotes(''); }}
                              style={{ padding: '7px 14px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#d1fae5'; e.currentTarget.style.color = '#065f46'; }}>
                              ✅ Complete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {r.notes && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f9fafb', borderRadius: '8px', fontSize: '12px', color: '#6b7280', borderLeft: '3px solid #e5e7eb' }}>
                        <strong>Notes:</strong> {r.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Complete with notes modal */}
      {notesModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '420px', maxWidth: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a2e', marginBottom: '6px' }}>✅ Complete Request</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>Add completion notes (optional):</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Describe what was done..."
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', resize: 'vertical', marginBottom: '20px', fontFamily: 'Inter, sans-serif' }}
              onFocus={e => e.target.style.borderColor = '#5B5CE2'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setNotesModal(null)} style={{ flex: 1, padding: '11px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleStatusUpdate(notesModal, 'completed')} style={{ flex: 1, padding: '11px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Mark Complete</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Maintenance;
