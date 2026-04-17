import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      background: '#5B5CE2',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }}>
      <div>
        <strong>Install App</strong>
        <p style={{ fontSize: '12px', marginTop: '4px' }}>Install DormHub on your device</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleInstall} style={{
          background: 'white',
          color: '#5B5CE2',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>Install</button>
        <button onClick={() => setShowPrompt(false)} style={{
          background: 'transparent',
          color: 'white',
          border: '1px solid white',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>Close</button>
      </div>
    </div>
  );
};

export default InstallPrompt;