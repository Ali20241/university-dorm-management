import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Penalties = () => {
  const [penalties, setPenalties] = useState([]);
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({ student_id: '', penalty_amount: '', penalty_type: 'late_payment', penalty_reason: '', due_date: '', notes: '' });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let res = penalties;
    if (statusFilter !== 'all') res = res.filter(p => p.status === statusFilter);
    if (search) res = res.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      p.penalty_reason?.toLowerCase().includes(search.toLowerCase()) ||
      p.penalty_type?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(res);
  }, [search, statusFilter, penalties]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [pRes, sRes] = await Promise.all([
        api.get('/admin/penalties', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/admin/students', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPenalties(pRes.penalties || []);
      setStudents(sRes.students || []);
    } catch (e) { showMsg('error', 'Failed to load data'); }
    finally { setLoading(false); }
  };

  const showMsg = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000); };

  const handleIssuePenalty = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/admin/penalties', formData, { headers: { Authorization: `Bearer ${token}` } });
      showMsg('success', 'Penalty issued successfully!');
      setShowModal(false);
      setFormData({ student_id: '', penalty_amount: '', penalty_type: 'late_payment', penalty_reason: '', due_date: '', notes: '' });
      fetchData();
    } catch (e) { showMsg('error', e.response?.data?.message || 'Failed to issue penalty'); }
  };

  const handleMarkPaid = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/penalties/${id}`, { status: 'paid', payment_date: new Date().toISOString().split('T')[0] }, { headers: { Authorization: `Bearer ${token}` } });
      showMsg('success', 'Penalty marked as paid!');
      fetchData();
    } catch (e) { showMsg('error', 'Failed to update penalty'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this penalty?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/penalties/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showMsg('success', 'Penalty deleted!');
      fetchData();
    } catch (e) { showMsg('error', 'Failed to delete penalty'); }
  };

  const totalUnpaid = penalties.filter(p => p.status === 'unpaid').reduce((s, p) => s + parseFloat(p.penalty_amount || 0), 0);
  const totalPaid = penalties.filter(p => p.status === 'paid').reduce((s, p) => s + parseFloat(p.penalty_amount || 0), 0);

  const penaltyTypeLabel = (t) => ({ late_payment: 'Late Payment', damage: 'Damage', violation: 'Rule Violation', other: 'Other' }[t] || t);

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fafafa', fontFamily: 'Inter, sans-serif' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>⚠️ Penalties</h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Issue and manage student penalties</p>
            </div>
            <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '12px', padding: '11px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
              <span>+</span> Issue Penalty
            </button>
          </div>

          {message && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '13px', fontWeight: '500', background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`, display: 'flex', gap: '8px', alignItems: 'center' }}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total Penalties', value: penalties.length, icon: '⚠️', color: '#5B5CE2', bg: '#eef0ff' },
              { label: 'Unpaid Count', value: penalties.filter(p => p.status === 'unpaid').length, icon: '🔴', color: '#ef4444', bg: '#fee2e2' },
              { label: 'Unpaid Amount', value: `ETB ${totalUnpaid.toLocaleString()}`, icon: '💸', color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Paid Amount', value: `ETB ${totalPaid.toLocaleString()}`, icon: '✅', color: '#10b981', bg: '#d1fae5' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', background: c.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{c.icon}</div>
                <div>
                  <p style={{ fontSize: typeof c.value === 'string' && c.value.length > 8 ? '16px' : '22px', fontWeight: '800', color: c.color }}>{c.value}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
              <input placeholder="Search penalties..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white' }}
                onFocus={e => e.target.style.borderColor = '#5B5CE2'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer' }}>
              <option value="all">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{filtered.length} penalt{filtered.length !== 1 ? 'ies' : 'y'}</p>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#5B5CE2', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#6b7280' }}>Loading penalties...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#4b5563' }}>No penalties found</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Student', 'Type', 'Reason', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, hsl(${i * 53 % 360},60%,60%), hsl(${(i * 53 + 40) % 360},70%,50%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                              {p.first_name?.charAt(0)}
                            </div>
                            <div>
                              <p style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '13px' }}>{p.first_name} {p.last_name}</p>
                              <p style={{ fontSize: '11px', color: '#9ca3af' }}>{p.student_code}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                          <span style={{ background: '#eef0ff', color: '#5B5CE2', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{penaltyTypeLabel(p.penalty_type)}</span>
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb', maxWidth: '200px' }}>
                          <p style={{ fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.penalty_reason}</p>
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                          <p style={{ fontWeight: '800', fontSize: '15px', color: '#ef4444' }}>ETB {parseFloat(p.penalty_amount || 0).toLocaleString()}</p>
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb', color: '#6b7280', fontSize: '13px' }}>
                          {p.due_date ? new Date(p.due_date).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                          <span style={{ background: p.status === 'paid' ? '#d1fae5' : '#fee2e2', color: p.status === 'paid' ? '#065f46' : '#991b1b', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                            {p.status === 'paid' ? '✅ Paid' : '🔴 Unpaid'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {p.status !== 'paid' && (
                              <button onClick={() => handleMarkPaid(p.id)} style={{ padding: '5px 10px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                                Mark Paid
                              </button>
                            )}
                            <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Issue Penalty Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '520px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a2e' }}>⚠️ Issue Penalty</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <form onSubmit={handleIssuePenalty}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Student *</label>
                <select value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} — {s.student_id}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Amount (ETB) *</label>
                  <input type="number" min="1" value={formData.penalty_amount} onChange={e => setFormData({ ...formData, penalty_amount: e.target.value })} required style={inputStyle} placeholder="e.g. 500" /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Penalty Type *</label>
                  <select value={formData.penalty_type} onChange={e => setFormData({ ...formData, penalty_type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="late_payment">Late Payment</option>
                    <option value="damage">Property Damage</option>
                    <option value="violation">Rule Violation</option>
                    <option value="other">Other</option>
                  </select></div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Reason *</label>
                <textarea value={formData.penalty_reason} onChange={e => setFormData({ ...formData, penalty_reason: e.target.value })} required rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe the reason for this penalty..." />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Due Date</label>
                <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} style={inputStyle} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Additional notes (optional)..." />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Issue Penalty</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Penalties;
