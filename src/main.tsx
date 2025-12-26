import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import i18n from './i18n/config';
import { setupErrorHandlers } from './utils/errorLogger';

// エラーハンドラーを設定
setupErrorHandlers();

// 初期言語を設定（localStorageから読み込み）
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

const initialLanguage = getStoredLanguage();
if (initialLanguage) {
  i18n.changeLanguage(initialLanguage).then(() => {
    document.documentElement.lang = initialLanguage;
    // 言語変更イベントを発火
    window.dispatchEvent(new Event('languagechange'));
    window.dispatchEvent(new Event('i18n:languageChanged'));
  }).catch((error) => {
    console.error('Failed to change language:', error);
  });
} else {
  // デフォルト言語を設定
  document.documentElement.lang = 'ja';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        console.log('[SW] Registered:', registration.scope);

        // Service Workerからのメッセージを受信
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATED') {
            console.log('[SW] Service Worker updated, reloading...');
            window.location.reload();
          }
        });

        // 更新をチェック
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // 新しいService Workerが利用可能
                  console.log('[SW] New version available');
                  // 自動的に更新を適用
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  // Service Workerがアクティブになったらリロード
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'activated') {
                      window.location.reload();
                    }
                  });
                } else {
                  // 初回インストール
                  console.log('[SW] Service Worker installed');
                }
              }
            });
          }
        });

        // 定期的に更新をチェック
        setInterval(() => {
          registration.update();
        }, 60000); // 1分ごと
      })
      .catch((error) => {
        console.error('[SW] Registration failed:', error);
      });
  });
}