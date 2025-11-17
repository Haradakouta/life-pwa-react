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

// Firebaseエラーコードを日本語メッセージに変換
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/user-disabled':
      return 'このアカウントは無効化されています';
    case 'auth/user-not-found':
      return 'メールアドレスまたはパスワードが正しくありません';
    case 'auth/wrong-password':
      return 'メールアドレスまたはパスワードが正しくありません';
    case 'auth/invalid-credential':
      return 'メールアドレスまたはパスワードが正しくありません';
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています';
    case 'auth/weak-password':
      return 'パスワードは6文字以上で設定してください';
    case 'auth/operation-not-allowed':
      return 'この認証方法は現在利用できません';
    case 'auth/too-many-requests':
      return 'リクエストが多すぎます。しばらく時間をおいてから再度お試しください';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください';
    case 'auth/popup-closed-by-user':
      return 'ログインがキャンセルされました';
    default:
      return `認証エラーが発生しました (${errorCode})`;
  }
};

// メールアドレスとパスワードでログイン
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error('Login error:', error.code, error.message);
    return { user: null, error: getErrorMessage(error.code) };
  }
};

// メールアドレスとパスワードで新規登録（メール確認なし）
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error('Register error:', error.code, error.message);
    return { user: null, error: getErrorMessage(error.code) };
  }
};

// メールアドレスとパスワードで新規登録 + 確認メール送信
export const registerWithEmailVerification = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 確認メールを送信
    await sendEmailVerification(user, {
      url: window.location.origin + '/', // 確認後のリダイレクトURL (Firebase Hosting用)
      handleCodeInApp: false,
    });

    return { user, error: null };
  } catch (error: any) {
    console.error('Register with verification error:', error.code, error.message);
    return { user: null, error: getErrorMessage(error.code) };
  }
};

// メール確認コードを適用
export const confirmEmailVerification = async (code: string) => {
  try {
    await applyActionCode(auth, code);
    return { error: null };
  } catch (error: any) {
    console.error('Confirm email verification error:', error.code, error.message);
    return { error: getErrorMessage(error.code) };
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
      url: window.location.origin + '/', // Firebase Hosting用
      handleCodeInApp: false,
    });

    return { error: null };
  } catch (error: any) {
    console.error('Resend verification email error:', error.code, error.message);
    return { error: getErrorMessage(error.code) };
  }
};

// Googleアカウントでログイン
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Google login error:', error.code, error.message);
    return { user: null, error: getErrorMessage(error.code) };
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
    console.error('Logout error:', error.code, error.message);
    return { error: getErrorMessage(error.code) };
  }
};

// 認証状態の監視
export const watchAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
