/**
 * メール確認コード管理
 * Firestoreを使って6桁の確認コードを管理
 */
import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// 6桁のランダムコードを生成
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 確認コードをFirestoreに保存（有効期限10分）
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

// 確認コードを検証
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

// メール送信（Firebase Cloud Functionsを使用）
export const sendVerificationEmail = async (email: string, code: string) => {
  try {
    // Cloud Functionを呼び出す
    const { httpsCallable } = await import('firebase/functions');
    const { functions } = await import('../config/firebase');

    const sendEmail = httpsCallable(functions, 'sendVerificationEmail');
    await sendEmail({ email, code });

    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send email via Cloud Function:', error);

    // フォールバック: 開発モードとしてアラート表示
    console.log(`
====================================
🥗💰 健康家計アプリ - メール確認コード
====================================

こんにちは！

健康家計アプリへのご登録ありがとうございます。

以下の確認コードを入力して、メールアドレスの確認を完了してください：

確認コード: ${code}

※ このコードは10分間有効です。
※ このメールに心当たりがない場合は、無視していただいて構いません。

━━━━━━━━━━━━━━━━━━━━━━━━
健康家計アプリについて
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

© 2025 健康家計アプリ
https://haradakouta.github.io/life-pwa-react/

====================================
    `);

    alert(`【開発モード】メール送信に失敗しました。\n確認コードをコンソールに表示しました:\n\n確認コード: ${code}\n\nこのコードを入力してください。`);
  }
};
