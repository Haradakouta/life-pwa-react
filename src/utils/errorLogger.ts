/**
 * エラーログ記録ユーティリティ
 * Firestoreにエラーログを自動保存
 */

import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  timestamp: string;
  errorType: 'error' | 'unhandledRejection' | 'resourceError';
  resourceUrl?: string;
}

/**
 * エラーログをFirestoreに保存
 */
export async function logError(error: ErrorLog): Promise<void> {
  try {
    // エラーログコレクションに保存
    await addDoc(collection(db, 'errorLogs'), {
      ...error,
      createdAt: new Date().toISOString(),
    });
    console.log('✅ エラーログを保存しました');
  } catch (err) {
    // エラーログの保存に失敗しても、コンソールには出力
    console.error('❌ エラーログの保存に失敗しました:', err);
    console.error('元のエラー:', error);
  }
}

/**
 * エラーハンドラーを設定
 */
export function setupErrorHandlers(): void {
  // JavaScriptエラー
  window.addEventListener('error', (event) => {
    const errorLog: ErrorLog = {
      message: event.message || 'Unknown error',
      stack: event.error?.stack,
      url: event.filename || window.location.href,
      userAgent: navigator.userAgent,
      userId: auth.currentUser?.uid,
      timestamp: new Date().toISOString(),
      errorType: 'error',
    };

    logError(errorLog);
  });

  // 未処理のPromise拒否
  window.addEventListener('unhandledrejection', (event) => {
    const errorLog: ErrorLog = {
      message: event.reason?.message || String(event.reason) || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: auth.currentUser?.uid,
      timestamp: new Date().toISOString(),
      errorType: 'unhandledRejection',
    };

    logError(errorLog);
  });

  // リソース読み込みエラー（画像、スクリプトなど）
  window.addEventListener('error', (event) => {
    if (event.target && (event.target as HTMLElement).tagName) {
      const target = event.target as HTMLElement;
      let resourceUrl = 'unknown';
      
      if (target instanceof HTMLImageElement || target instanceof HTMLScriptElement) {
        resourceUrl = target.src;
      } else if (target instanceof HTMLLinkElement) {
        resourceUrl = target.href;
      }
      
      const errorLog: ErrorLog = {
        message: `Resource load error: ${target.tagName}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: auth.currentUser?.uid,
        timestamp: new Date().toISOString(),
        errorType: 'resourceError',
        resourceUrl,
      };

      logError(errorLog);
    }
  }, true); // キャプチャフェーズで捕捉

  console.log('✅ エラーハンドラーを設定しました');
}

/**
 * 手動でエラーをログに記録
 */
export function logManualError(message: string, error?: Error): void {
  const errorLog: ErrorLog = {
    message,
    stack: error?.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId: auth.currentUser?.uid,
    timestamp: new Date().toISOString(),
    errorType: 'error',
  };

  logError(errorLog);
}

