import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

const RegisterPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studentId: '',
    phone: '',
    major: '',
    year: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch') || 'Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError(t('passwordMinLength') || 'Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentId: formData.studentId,
        phone: formData.phone,
        major: formData.major,
        year: formData.year
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '10px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ textAlign: 'center', color: '#667eea', marginBottom: '10px' }}>🎓 {t('register')}</h1>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '30px' }}>
          {t('createAccount') || 'Create your account to apply for dormitory rooms'}
        </p>
        
        {error && (
          <div style={{
            background: '#fed7d7',
            color: '#742a2a',
            padding: '12px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <input
              type="text"
              name="firstName"
              placeholder={t('firstName') || 'First Name'}
              value={formData.firstName}
              onChange={handleChange}
              required
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
            <input
              type="text"
              name="lastName"
              placeholder={t('lastName') || 'Last Name'}
              value={formData.lastName}
              onChange={handleChange}
              required
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          
          <input
            type="email"
            name="email"
            placeholder={t('email')}
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '15px' }}
          />
          
          <input
            type="text"
            name="studentId"
            placeholder={t('studentId') || 'Student ID'}
            value={formData.studentId}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '15px' }}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <input
              type="password"
              name="password"
              placeholder={t('password')}
              value={formData.password}
              onChange={handleChange}
              required
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder={t('confirmPassword')}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <input
              type="tel"
              name="phone"
              placeholder={t('phone') || 'Phone Number'}
              value={formData.phone}
              onChange={handleChange}
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
            <input
              type="text"
              name="major"
              placeholder={t('major') || 'Major/Department'}
              value={formData.major}
              onChange={handleChange}
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '20px' }}
          >
            <option value="">{t('selectYear') || 'Select Year'}</option>
            <option value="1">1st {t('year') || 'Year'}</option>
            <option value="2">2nd {t('year') || 'Year'}</option>
            <option value="3">3rd {t('year') || 'Year'}</option>
            <option value="4">4th {t('year') || 'Year'}</option>
          </select>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? t('loading') : t('register')}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          {t('haveAccount')}{' '}
          <Link to="/login" style={{ color: '#667eea' }}>
            {t('loginHere')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;