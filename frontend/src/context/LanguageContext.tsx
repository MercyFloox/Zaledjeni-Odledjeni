import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n, { LANGUAGES, setLanguage, getLanguage, STORAGE_KEY } from '../i18n';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  t: (key: string, options?: object) => string;
  languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState(i18n.locale);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLocale = await getLanguage();
      setLocaleState(savedLocale);
      setIsReady(true);
    };
    loadLanguage();
  }, []);

  const setLocale = async (newLocale: string) => {
    await setLanguage(newLocale);
    setLocaleState(newLocale);
  };

  const t = (key: string, options?: object): string => {
    return i18n.t(key, options);
  };

  if (!isReady) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
