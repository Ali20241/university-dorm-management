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
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', color: '#1a1a2e', marginBottom: '10px', fontSize: '24px', fontWeight: '600' }}>🏛️ {t('appTitle')}</h1>
        <h2 style={{ textAlign: 'center', color: '#5B5CE2', marginBottom: '30px', fontSize: '20px', fontWeight: '600' }}>{t('login')}</h2>
        
        {error && (
          <div style={{
            background: '#FEF2F2',
            color: '#EF4444',
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #FEE2E2',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500', fontSize: '14px' }}>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#5B5CE2'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500', fontSize: '14px' }}>{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '45px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#5B5CE2'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#6B7280',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          {/* Forgot Password Link */}
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/forgot-password" style={{ color: '#5B5CE2', fontSize: '12px', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#5B5CE2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.2s',
              height: '44px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#4C4DC9';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#5B5CE2';
            }}
          >
            {loading ? t('loading') : t('login')}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#6B7280', fontSize: '14px' }}>
          {t('noAccount')}{' '}
          <Link to="/register" style={{ color: '#5B5CE2', textDecoration: 'none', fontWeight: '500' }}>
            {t('registerHere')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;