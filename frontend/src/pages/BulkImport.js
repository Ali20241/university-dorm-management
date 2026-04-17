import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const BulkImport = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(null);
    setResult(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/students/template', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download template' });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/admin/students/bulk-import', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
      setMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Import failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F7F8FC' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar role="admin" />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>📤 Bulk Student Import</h1>
            <p style={{ color: '#6B7280' }}>Import multiple students at once using Excel/CSV file</p>
          </div>

          {message && (
            <div style={{
              background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: message.type === 'success' ? '#065F46' : '#991B1B',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {message.text}
            </div>
          )}

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Step 1: Download Template</h3>
            <button
              onClick={handleDownloadTemplate}
              style={{
                background: '#5B5CE2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              📥 Download Excel Template
            </button>
            <p style={{ marginTop: '12px', fontSize: '13px', color: '#6B7280' }}>
              The template contains columns: email, password, firstName, lastName, studentId, phone, major, year, gender
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Step 2: Upload File</h3>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              style={{ marginBottom: '16px' }}
            />
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              style={{
                background: '#10B981',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: !file || loading ? 'not-allowed' : 'pointer',
                opacity: !file || loading ? 0.5 : 1
              }}
            >
              {loading ? 'Importing...' : '📤 Upload & Import'}
            </button>
          </div>

          {result && (
            <div style={{
              background: '#F9FAFB',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E5E7EB'
            }}>
              <h3 style={{ marginBottom: '16px' }}>Import Results</h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <span style={{ color: '#10B981' }}>✅ Successful: {result.successCount}</span>
                <span style={{ color: '#EF4444' }}>❌ Failed: {result.errorCount}</span>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div>
                  <strong>Errors:</strong>
                  <ul style={{ marginTop: '8px', marginLeft: '20px', color: '#EF4444', fontSize: '13px' }}>
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BulkImport;