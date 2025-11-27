/**
 * メール確認コード管理
 * Firestoreを使って6桁の確認コードを管理
 */
import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * 6桁のランダムな確認コードを生成
 * @returns 100000から999999の範囲のランダムな6桁の数字文字列
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 確認コードをFirestoreに保存（有効期限10分）
 * @param email - メールアドレス
 * @param code - 確認コード
 */
export const saveVerificationCode = async (email: string, code: string) => {
  const codeDoc = doc(collection(db, 'verificationCodes'), email);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10分後に期限切れ

  await setDoc(codeDoc, {
    code,
    email,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  });
};

/**
 * 確認コードを検証
 * @param email - メールアドレス
 * @param inputCode - 入力された確認コード
 * @returns 検証結果（有効性とエラーメッセージ）
 */
export const verifyCode = async (email: string, inputCode: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const codeDoc = doc(collection(db, 'verificationCodes'), email);
    const docSnap = await getDoc(codeDoc);

    if (!docSnap.exists()) {
      return { valid: false, error: '確認コードが見つかりません。再送信してください。' };
    }

    const data = docSnap.data();
    const expiresAt = new Date(data.expiresAt);

    // 期限切れチェック
    if (expiresAt < new Date()) {
      await deleteDoc(codeDoc);
      return { valid: false, error: '確認コードの有効期限が切れています。再送信してください。' };
    }

    // コード検証
    if (data.code !== inputCode) {
      return { valid: false, error: '確認コードが正しくありません。' };
    }

    // 検証成功：コードを削除
    await deleteDoc(codeDoc);
    return { valid: true };
  } catch (error) {
    console.error('Code verification error:', error);
    return { valid: false, error: '確認に失敗しました。もう一度お試しください。' };
  }
};

/**
 * メール送信（Cloud Functionsを使用）
 * @param email - 送信先メールアドレス
 * @param code - 確認コード
 * @throws メール送信に失敗した場合
 */
export const sendVerificationEmail = async (email: string, code: string) => {
  try {
    // onRequest関数は直接HTTPリクエストで呼び出す
    const url = 'https://us-central1-oshi-para.cloudfunctions.net/sendVerificationEmailV2';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Verification email sent to ${email}`, result);
  } catch (error: unknown) {
    console.error('Failed to send email via Cloud Functions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
    });

    // フォールバック: 開発モードとしてコンソールに表示
    console.log(`
====================================
🥗💰 けんすけ - メール確認コード
====================================

こんにちは！

けんすけへのご登録ありがとうございます。

以下の確認コードを入力して、メールアドレスの確認を完了してください：

確認コード: ${code}

※ このコードは10分間有効です。
※ このメールに心当たりがない場合は、無視していただいて構いません。

━━━━━━━━━━━━━━━━━━━━━━━━
けんすけについて
━━━━━━━━━━━━━━━━━━━━━━━━

AIが健康をサポートする生活管理アプリです。

主な機能：
✓ 食事記録とカロリー管理
✓ AIレシピ生成
✓ 家計簿機能
✓ 在庫管理
✓ バーコードスキャン
✓ レシートOCR（自動読み取り）

━━━━━━━━━━━━━━━━━━━━━━━━

© 2025 けんすけ
https://healthfinanse.jp

====================================
    `);

    alert(`【開発モード】Cloud Function未設定です。\n確認コードをコンソールに表示しました:\n\n確認コード: ${code}\n\nこのコードを入力してください。`);

    // エラーを再スローして上位で処理
    throw new Error('メール送信に失敗しました。コンソールで確認コードを確認してください。');
  }
};

/**
 * パスワードリセット用のメール送信
 * @param email - 送信先メールアドレス
 * @param code - 確認コード
 */
export const sendPasswordResetEmail = async (email: string, code: string) => {
  try {
    // Cloud Functionを呼び出す（リージョン: us-central1）
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const { default: app } = await import('../config/firebase');

    const functions = getFunctions(app, 'us-central1');
    const sendEmail = httpsCallable(functions, 'sendPasswordResetEmail');

    // Cloud Functionにメール送信をリクエスト
    const result = await sendEmail({ email, code });

    console.log(`✅ Password reset email sent to ${email}`, result);
  } catch (error: unknown) {
    console.error('Failed to send password reset email via Cloud Functions:', error);
    const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error && typeof error === 'object' && 'details' in error ? error.details : undefined;
    console.error('Error details:', {
      code: errorCode,
      message: errorMessage,
      details: errorDetails,
    });

    // フォールバック: 開発モードとしてコンソールに表示
    console.log(`
====================================
🥗💰 けんすけ - パスワードリセット
====================================

こんにちは！

パスワードのリセットをリクエストいただきありがとうございます。

以下の確認コードを入力して、パスワードのリセットを完了してください：

確認コード: ${code}

※ このコードは10分間有効です。
※ このメールに心当たりがない場合は、無視していただいて構いません。

━━━━━━━━━━━━━━━━━━━━━━━━

© 2025 けんすけ
https://healthfinanse.jp

====================================
    `);

    alert(`【開発モード】Cloud Function未設定です。\n確認コードをコンソールに表示しました:\n\n確認コード: ${code}\n\nこのコードを入力してください。`);

    // エラーを再スローせず、続行（開発モード）
  }
};

/**
 * パスワードをリセット（Cloud Functionsを使用）
 * @param email - メールアドレス
 * @param newPassword - 新しいパスワード
 * @returns リセット結果（成功・失敗とエラーメッセージ）
 */
export const resetPasswordWithCode = async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Cloud Functionを呼び出す（リージョン: us-central1）
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const { default: app } = await import('../config/firebase');

    const functions = getFunctions(app, 'us-central1');
    const resetPassword = httpsCallable(functions, 'resetPassword');

    // Cloud Functionにパスワードリセットをリクエスト
    const result = await resetPassword({ email, newPassword });

    console.log(`✅ Password reset successful for ${email}`, result);
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to reset password via Cloud Functions:', error);
    const errorMessage = error instanceof Error ? error.message : 'パスワードのリセットに失敗しました';
    return { success: false, error: errorMessage };
  }
};
