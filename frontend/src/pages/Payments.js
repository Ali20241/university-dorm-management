import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchPayments(); }, []);

  useEffect(() => {
    let res = payments;
    if (statusFilter !== 'all') res = res.filter(p => p.status === statusFilter);
    if (search) res = res.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      p.student_code?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(res);
  }, [search, statusFilter, payments]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/admin/payments', { headers: { Authorization: `Bearer ${token}` } });
      setPayments(res.payments || []);
    } catch (e) { showMsg('error', 'Failed to load payments'); }
    finally { setLoading(false); }
  };

  const showMsg = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000); };

  const totals = {
    paid: payments.filter(p => p.status === 'paid').reduce((s, p) => s + parseFloat(p.amount || 0), 0),
    pending: payments.filter(p => p.status === 'pending').reduce((s, p) => s + parseFloat(p.amount || 0), 0),
    overdue: payments.filter(p => p.status === 'overdue').reduce((s, p) => s + parseFloat(p.amount || 0), 0),
  };

  const statusStyle = (s) => ({
    paid: { bg: '#d1fae5', color: '#065f46', icon: '✅', label: 'Paid' },
    pending: { bg: '#fef3c7', color: '#92400e', icon: '⏳', label: 'Pending' },
    overdue: { bg: '#fee2e2', color: '#991b1b', icon: '🔴', label: 'Overdue' },
  }[s] || { bg: '#f3f4f6', color: '#6b7280', icon: '❓', label: s });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>💰 Payments</h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Track and manage all student payments</p>
          </div>

          {message && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '13px', fontWeight: '500', background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`, display: 'flex', gap: '8px', alignItems: 'center' }}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total Records', value: payments.length, icon: '📄', color: '#5B5CE2', bg: '#eef0ff', isNum: true },
              { label: 'Total Paid', value: `ETB ${totals.paid.toLocaleString()}`, icon: '✅', color: '#10b981', bg: '#d1fae5' },
              { label: 'Pending', value: `ETB ${totals.pending.toLocaleString()}`, icon: '⏳', color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Overdue', value: `ETB ${totals.overdue.toLocaleString()}`, icon: '🔴', color: '#ef4444', bg: '#fee2e2' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '18px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '46px', height: '46px', background: c.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <p style={{ fontSize: c.isNum ? '26px' : '16px', fontWeight: '800', color: c.color, lineHeight: 1.2 }}>{c.value}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500', marginTop: '2px' }}>{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
              <input placeholder="Search by student name or ID..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white' }}
                onFocus={e => e.target.style.borderColor = '#5B5CE2'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer' }}>
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{filtered.length} payment record{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#5B5CE2', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#6b7280' }}>Loading payments...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#4b5563' }}>No payments found</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Student', 'Student ID', 'Amount', 'Month', 'Due Date', 'Payment Date', 'Status'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => {
                      const ss = statusStyle(p.status);
                      return (
                        <tr key={p.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, hsl(${i * 53 % 360},60%,60%), hsl(${(i * 53 + 40) % 360},70%,50%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                                {p.first_name?.charAt(0)}
                              </div>
                              <p style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '13px' }}>{p.first_name} {p.last_name}</p>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb', color: '#5B5CE2', fontWeight: '600', fontSize: '13px' }}>{p.student_code || '—'}</td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <p style={{ fontWeight: '800', fontSize: '15px', color: '#1a1a2e' }}>ETB {parseFloat(p.amount || 0).toLocaleString()}</p>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb', color: '#374151', fontSize: '13px' }}>{p.month || '—'}</td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb', color: '#6b7280', fontSize: '13px' }}>
                            {p.due_date ? new Date(p.due_date).toLocaleDateString() : '—'}
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb', color: '#6b7280', fontSize: '13px' }}>
                            {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '—'}
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: '1px solid #f9fafb' }}>
                            <span style={{ background: ss.bg, color: ss.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                              {ss.icon} {ss.label}
                            </span>
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Payments;
