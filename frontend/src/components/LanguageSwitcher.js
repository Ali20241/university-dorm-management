import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = ({ isCollapsed = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', localName: 'English' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹', localName: 'አማርኛ' },
    { code: 'om', name: 'Oromo', flag: '🇪🇹', localName: 'Oromoo' },
    { code: 'so', name: 'Somali', flag: '🇸🇴', localName: 'Soomaali' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', localName: 'العربية' },
  ];

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  if (isCollapsed) {
    // Show only flag icon when collapsed
    return (
      <div className="language-switcher-collapsed">
        <button 
          className="lang-btn-collapsed"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px'
          }}
        >
          {currentLanguage.flag}
        </button>
        {isOpen && (
          <div className="lang-dropdown-collapsed" style={{
            position: 'absolute',
            bottom: '60px',
            left: '10px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 200,
            minWidth: '150px'
          }}>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 15px',
                  border: 'none',
                  background: language === lang.code ? '#EEF2FF' : 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.localName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full version when expanded
  return (
    <div className="language-switcher">
      <button 
        className="language-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          background: '#F3F4F6',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        <span>{currentLanguage.flag}</span>
        <span style={{ flex: 1, textAlign: 'left' }}>{currentLanguage.localName}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown" style={{
          position: 'absolute',
          bottom: '70px',
          left: '10px',
          right: '10px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          zIndex: 200
        }}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 15px',
                border: 'none',
                background: language === lang.code ? '#EEF2FF' : 'white',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left'
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.localName}</span>
              {language === lang.code && <span style={{ marginLeft: 'auto', color: 'var(--primary-color)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;