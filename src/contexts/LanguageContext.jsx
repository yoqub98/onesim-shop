// src/contexts/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../config/i18n.js';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Get initial language from localStorage or use default
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('onesim_language');
    return saved || DEFAULT_LANGUAGE;
  });

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onesim_language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (lang) => {
    if (Object.values(LANGUAGES).includes(lang)) {
      setCurrentLanguage(lang);
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    languages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
