import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import sr from './sr';
import en from './en';
import es from './es';
import de from './de';
import fr from './fr';
import pt from './pt';

const i18n = new I18n({
  sr,
  en,
  es,
  de,
  fr,
  pt,
});

// Default to device locale or Serbian
i18n.defaultLocale = 'sr';
i18n.locale = 'sr';
i18n.enableFallback = true;

export const LANGUAGES = [
  { code: 'sr', name: 'Srpski', flag: '🇷🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português (Brasil)', flag: '🇧🇷' },
];

export const STORAGE_KEY = '@app_language';

export const setLanguage = async (locale: string) => {
  i18n.locale = locale;
  await AsyncStorage.setItem(STORAGE_KEY, locale);
};

export const getLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedLanguage) {
      i18n.locale = savedLanguage;
      return savedLanguage;
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
  return i18n.locale;
};

export default i18n;
