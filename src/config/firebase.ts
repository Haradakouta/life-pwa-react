import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getMessaging, type Messaging } from 'firebase/messaging';

// Firebase設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// Firebase Authenticationのインスタンス
export const auth = getAuth(app);

// Firestoreのインスタンス
export const db = getFirestore(app);

// Cloud Functionsのインスタンス（リージョン: us-central1）
// 注: 現在デプロイされている関数はus-central1リージョンにあります
export const functions = getFunctions(app, 'us-central1');

// Firebase Storageのインスタンス
export const storage = getStorage(app);

// Firebase Cloud Messagingのインスタンス（ブラウザ環境でのみ初期化）
let messaging: Messaging | null = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging initialization failed:', error);
  }
}
export { messaging };

export default app;
