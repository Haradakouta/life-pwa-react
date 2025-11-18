import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ja from './locales/ja.json';
import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import ko from './locales/ko.json';
import vi from './locales/vi.json';
import ru from './locales/ru.json';
import id from './locales/id.json';

const resources = {
  ja: { translation: ja },
  en: { translation: en },
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  ko: { translation: ko },
  vi: { translation: vi },
  ru: { translation: ru },
  id: { translation: id },
};

// 設定から言語を取得（localStorageから）
const getStoredLanguage = (): string | undefined => {
  try {
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      return settings.language;
    }
  } catch (error) {
    console.error('Failed to get stored language:', error);
  }
  return undefined;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja',
    lng: getStoredLanguage() || undefined, // 設定から言語を読み込む
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;

