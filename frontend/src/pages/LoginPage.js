import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

      {/* Left panel – branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        color: 'white',
        position: 'relative',
        zIndex: 1
      }} className="login-left-panel">
        <div style={{ maxWidth: '460px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px' }}>
            <div style={{
              width: '52px', height: '52px', background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
            }}>🏛️</div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>DormHub</h1>
              <p style={{ opacity: 0.75, fontSize: '13px' }}>University Dormitory System</p>
            </div>
          </div>
          <h2 style={{ fontSize: '38px', fontWeight: '800', lineHeight: 1.2, marginBottom: '20px', letterSpacing: '-1px' }}>
            Smart Dormitory<br/>Management
          </h2>
          <p style={{ opacity: 0.8, fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>
            Manage room allocations, maintenance requests, payments, and more — all from one place.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🏠', text: 'Effortless room assignment & management' },
              { icon: '📊', text: 'Real-time analytics & occupancy reports' },
              { icon: '🔧', text: 'Streamlined maintenance tracking' },
              { icon: '💰', text: 'Integrated payment & penalty system' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px', height: '38px', background: 'rgba(255,255,255,0.15)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0
                }}>{f.icon}</div>
                <span style={{ opacity: 0.9, fontSize: '14px' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{
        width: '480px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative',
        zIndex: 1
      }} className="login-right-panel">
        <div style={{
          background: 'white',
          borderRadius: '28px',
          padding: '44px',
          width: '100%',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px' }}>
              Welcome back 👋
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', color: '#991b1b', padding: '12px 16px',
              borderRadius: '10px', marginBottom: '20px', fontSize: '13px',
              border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
                Email Address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@university.edu"
                style={{
                  width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb',
                  borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s',
                  background: '#fafafa', color: '#1a1a2e'
                }}
                onFocus={e => { e.target.style.borderColor = '#5B5CE2'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px', border: '1.5px solid #e5e7eb',
                    borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s',
                    background: '#fafafa', color: '#1a1a2e'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#5B5CE2'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#9ca3af'
                }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link to="/forgot-password" style={{ color: '#5B5CE2', fontSize: '13px', fontWeight: '500' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: loading ? '#a5a6f6' : 'linear-gradient(135deg, #5B5CE2, #7C3AED)',
              color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(91,92,226,0.4)'
            }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#5B5CE2', fontWeight: '600' }}>Create account</Link>
          </div>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: '24px', padding: '14px 16px', background: '#f8faff',
            borderRadius: '10px', border: '1px solid #e0e7ff'
          }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: '600' }}>Demo Credentials</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#9ca3af' }}>Admin</p>
                <p style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500' }}>admin@university.edu</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#9ca3af' }}>Student</p>
                <p style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500' }}>student@university.edu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .login-left-panel { display: none !important; }
          .login-right-panel { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
