import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await axios.post('http://localhost:5001/api/auth/forgot-password', { email });
      setSubmitted(true);
      setMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '48px' }}>📧</span>
          <h2 style={{ marginTop: '20px', color: '#1a1a2e' }}>Check Your Email</h2>
          <p style={{ color: '#6B7280', marginTop: '10px' }}>
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '20px' }}>
            The link will expire in 1 hour.
          </p>
          <Link to="/login" style={{
            display: 'inline-block',
            marginTop: '20px',
            color: '#5B5CE2',
            textDecoration: 'none'
          }}>Back to Login</Link>
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
        <h1 style={{ textAlign: 'center', color: '#5B5CE2', marginBottom: '10px' }}>🔐 Forgot Password</h1>
        <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '30px' }}>
          Enter your email address and we'll send you a link to reset your password.
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
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>Email Address</label>
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
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#6B7280', fontSize: '14px' }}>
          <Link to="/login" style={{ color: '#5B5CE2', textDecoration: 'none' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;