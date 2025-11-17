/**
 * プッシュ通知機能のユーティリティ関数
 */

import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../config/firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';

// VAPIDキー（Firebase Console > プロジェクト設定 > Cloud Messaging > Web設定から取得）
// 本番環境では環境変数から取得することを推奨
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || '';

/**
 * プッシュ通知の許可をリクエスト
 */
export const requestPushNotificationPermission = async (): Promise<boolean> => {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return false;
  }

  try {
    // ブラウザの通知許可をリクエスト
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * FCMトークンを取得
 */
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return null;
  }

  try {
    // 通知許可を確認
    const permission = Notification.permission;
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // FCMトークンを取得
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * FCMトークンをFirestoreに保存
 */
export const saveFCMTokenToFirestore = async (token: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('ユーザーがログインしていません');
  }

  try {
    const tokenRef = doc(db, 'users', user.uid, 'fcmTokens', token);
    await setDoc(tokenRef, {
      token,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('FCM token saved to Firestore');
  } catch (error) {
    console.error('Error saving FCM token:', error);
    throw error;
  }
};

/**
 * ユーザーのFCMトークンを取得（Firestoreから）
 */
export const getUserFCMTokens = async (userId: string): Promise<string[]> => {
  try {
    const tokensRef = collection(db, 'users', userId, 'fcmTokens');
    const snapshot = await getDocs(tokensRef);
    return snapshot.docs.map((doc) => doc.data().token);
  } catch (error) {
    console.error('Error getting user FCM tokens:', error);
    return [];
  }
};

/**
 * フォアグラウンドでのプッシュ通知受信をリッスン
 */
export const onForegroundMessage = (
  callback: (payload: any) => void
): (() => void) | null => {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return null;
  }

  try {
    return onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
    return null;
  }
};

/**
 * プッシュ通知を初期化（許可リクエスト + トークン取得 + Firestore保存）
 */
export const initializePushNotifications = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    console.log('User not logged in, skipping push notification initialization');
    return false;
  }

  try {
    // 通知許可をリクエスト
    const permissionGranted = await requestPushNotificationPermission();
    if (!permissionGranted) {
      return false;
    }

    // FCMトークンを取得
    const token = await getFCMToken();
    if (!token) {
      return false;
    }

    // Firestoreに保存
    await saveFCMTokenToFirestore(token);
    return true;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
};

