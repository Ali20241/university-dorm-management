import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const RegisterPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', studentId: '',
    phone: '', major: '', year: '', gender: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.studentId) {
        setError('Please fill in all required fields'); return;
      }
    }
    if (step === 2) {
      if (!formData.email || !formData.password) {
        setError('Please fill in all required fields'); return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match'); return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters'); return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        email: formData.email, password: formData.password,
        firstName: formData.firstName, lastName: formData.lastName,
        studentId: formData.studentId, phone: formData.phone,
        major: formData.major, year: formData.year, gender: formData.gender
      });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fafafa', color: '#1a1a2e',
    transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
  };

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' };

  const steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Account' },
    { num: 3, label: 'Academic' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-120px', left: '-60px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

      <div style={{
        background: 'white', borderRadius: '28px', padding: '44px',
        width: '100%', maxWidth: '560px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative', zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '6px' }}>Create Account</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Join DormHub to apply for dormitory rooms</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '32px' }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700', transition: 'all 0.3s',
                  background: step > s.num ? '#10b981' : step === s.num ? '#5B5CE2' : '#e5e7eb',
                  color: step >= s.num ? 'white' : '#9ca3af'
                }}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span style={{ fontSize: '11px', color: step >= s.num ? '#5B5CE2' : '#9ca3af', fontWeight: step === s.num ? '600' : '400', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  height: '2px', width: '60px', margin: '0 8px', marginBottom: '18px',
                  background: step > s.num ? '#10b981' : '#e5e7eb', transition: 'background 0.3s'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', color: '#991b1b', padding: '12px 16px',
            borderRadius: '10px', marginBottom: '20px', fontSize: '13px',
            border: '1px solid #fecaca', display: 'flex', gap: '8px', alignItems: 'center'
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required
                  placeholder="John" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#5B5CE2'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; }} />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required
                  placeholder="Doe" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#5B5CE2'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; }} />
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Student ID *</label>
              <input name="studentId" value={formData.studentId} onChange={handleChange} required
                placeholder="e.g. UGR/12345/15" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#5B5CE2'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="+251 9..." style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#5B5CE2'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; }} />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{
              width: '100%', padding: '13px', background: 'linear-gradient(135deg, #5B5CE2, #7C3AED)',
              color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer'
            }}>Next: Account Setup →</button>
          </form>
        )}

        {/* Step 2: Account */}
        {step === 2 && (
          <form onSubmit={handleNext}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="john@university.edu" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#5B5CE2'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Password *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required
                placeholder="Min. 6 characters" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#5B5CE2'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; }} />
              {formData.password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '2px', transition: 'width 0.3s, background 0.3s',
                      width: formData.password.length >= 8 ? '100%' : formData.password.length >= 6 ? '60%' : '30%',
                      background: formData.password.length >= 8 ? '#10b981' : formData.password.length >= 6 ? '#f59e0b' : '#ef4444'
                    }} />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                    Strength: {formData.password.length >= 8 ? 'Strong 💪' : formData.password.length >= 6 ? 'Medium 🔐' : 'Weak ⚠️'}
                  </p>
                </div>
              )}
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Confirm Password *</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                placeholder="Re-enter password" style={{
                  ...inputStyle,
                  borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword ? '#ef4444' : '#e5e7eb'
                }}
                onFocus={e => { e.target.style.borderColor = '#5B5CE2'; e.target.style.background = '#fff'; }}
                onBlur={e => {
                  e.target.style.borderColor = formData.confirmPassword && formData.password !== formData.confirmPassword ? '#ef4444' : '#e5e7eb';
                  e.target.style.background = '#fafafa';
                }} />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>⚠️ Passwords do not match</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setStep(1)} style={{
                flex: 1, padding: '13px', background: '#f3f4f6', color: '#374151',
                border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>← Back</button>
              <button type="submit" style={{
                flex: 2, padding: '13px', background: 'linear-gradient(135deg, #5B5CE2, #7C3AED)',
                color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
              }}>Next: Academic Info →</button>
            </div>
          </form>
        )}

        {/* Step 3: Academic */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Major / Department</label>
              <input name="major" value={formData.major} onChange={handleChange}
                placeholder="e.g. Computer Science" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#5B5CE2'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Academic Year</label>
              <select name="year" value={formData.year} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year</option>
              </select>
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
              <p style={{ fontSize: '13px', color: '#166534', fontWeight: '600', marginBottom: '8px' }}>✅ Ready to create your account</p>
              <p style={{ fontSize: '12px', color: '#4b5563' }}>
                <strong>{formData.firstName} {formData.lastName}</strong> — {formData.email}
              </p>
              <p style={{ fontSize: '12px', color: '#4b5563' }}>Student ID: {formData.studentId}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setStep(2)} style={{
                flex: 1, padding: '13px', background: '#f3f4f6', color: '#374151',
                border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>← Back</button>
              <button type="submit" disabled={loading} style={{
                flex: 2, padding: '13px',
                background: loading ? '#a5a6f6' : 'linear-gradient(135deg, #5B5CE2, #7C3AED)',
                color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px',
                fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer'
              }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Creating account...
                  </span>
                ) : '🎉 Create Account'}
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#5B5CE2', fontWeight: '600' }}>Sign in</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default RegisterPage;
