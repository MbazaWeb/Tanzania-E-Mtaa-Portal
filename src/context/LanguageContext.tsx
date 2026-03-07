import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, useTranslation } from '@/src/lib/i18n';
import { CurrencyCode } from '@/src/lib/currency';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: any;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('sw');
  const [currency, setCurrency] = useState<CurrencyCode>('TZS');
  const t = useTranslation(lang);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    // Always use TZS for Tanzanian government services
    // Currency can still be changed separately via setCurrency if needed
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t, currency, setCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
