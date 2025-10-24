import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  applyActionCode,
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

// メールアドレスとパスワードで新規登録（メール確認なし）
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// メールアドレスとパスワードで新規登録 + 確認メール送信
export const registerWithEmailVerification = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 確認メールを送信
    await sendEmailVerification(user, {
      url: window.location.origin + '/life-pwa-react/', // 確認後のリダイレクトURL
      handleCodeInApp: false,
    });

    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// メール確認コードを適用
export const confirmEmailVerification = async (code: string) => {
  try {
    await applyActionCode(auth, code);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 確認メールを再送信
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: 'ユーザーがログインしていません' };
    }

    await sendEmailVerification(user, {
      url: window.location.origin + '/life-pwa-react/',
      handleCodeInApp: false,
    });

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
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
