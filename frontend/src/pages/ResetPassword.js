import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [token, setToken] = useState(null);
  const [validToken, setValidToken] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    
    if (!resetToken) {
      setVerifying(false);
      setMessage({ type: 'error', text: 'Invalid reset link' });
      return;
    }
    
    setToken(resetToken);
    
    // Verify token
    axios.post('http://localhost:5001/api/auth/verify-reset-token', { token: resetToken })
      .then(response => {
        setValidToken(true);
        setVerifying(false);
      })
      .catch(error => {
        setVerifying(false);
        setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid or expired reset link' });
      });
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      await axios.post('http://localhost:5001/api/auth/reset-password', {
        token,
        new_password: password
      });
      setMessage({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
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
          textAlign: 'center'
        }}>
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
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
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <span style={{ fontSize: '48px' }}>⚠️</span>
          <h2 style={{ marginTop: '20px', color: '#1a1a2e' }}>Invalid Reset Link</h2>
          <p style={{ color: '#6B7280', marginTop: '10px' }}>
            {message?.text || 'The password reset link is invalid or has expired.'}
          </p>
          <Link to="/forgot-password" style={{
            display: 'inline-block',
            marginTop: '20px',
            background: '#5B5CE2',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none'
          }}>Request New Link</Link>
        </div>
      </div>
    );
  }

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
        <h1 style={{ textAlign: 'center', color: '#5B5CE2', marginBottom: '10px' }}>🔐 Reset Password</h1>
        <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '30px' }}>
          Enter your new password below.
        </p>
        
        {message && (
          <div style={{
            background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: message.type === 'success' ? '#065F46' : '#991B1B',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '45px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
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
                  fontSize: '18px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
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
              height: '44px'
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#6B7280', fontSize: '14px' }}>
          <Link to="/login" style={{ color: '#5B5CE2', textDecoration: 'none' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;