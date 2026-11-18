'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language } from '@/types/portfolio';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (ar: string | null | undefined, en: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');

  useEffect(() => {
    const saved = window.localStorage.getItem('mg_portfolio_lang');
    if (saved === 'en' || saved === 'ar') {
      setLangState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLang = (next: Language) => {
    setLangState(next);
    window.localStorage.setItem('mg_portfolio_lang', next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const t = (ar: string | null | undefined, en: string | null | undefined) => {
    if (lang === 'en') return en || ar || '';
    return ar || en || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
