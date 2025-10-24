import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';

// メールアドレスとパスワードでログイン
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// メールアドレスとパスワードで新規登録
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Googleアカウントでログイン
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// ログアウト
export const logout = async () => {
  try {
    await signOut(auth);
    // localStorageをクリア（次のユーザーのデータと混在しないように）
    localStorage.clear();
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 認証状態の監視
export const watchAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
