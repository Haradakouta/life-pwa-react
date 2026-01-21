import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { BigQuery } from '@google-cloud/bigquery';

admin.initializeApp();
const db = admin.firestore();

// BigQuery - 遅延初期化でタイムアウトを防ぐ
let bigquery: BigQuery;
function getBigQuery() {
  if (!bigquery) {
    bigquery = new BigQuery();
  }
  return bigquery;
}
const DATASET_ID = 'gemini_logs';
const TABLE_ID = 'interactions';

// 型定義
interface SendVerificationEmailData {
  email: string;
  code: string;
}

interface ResetPasswordData {
  email: string;
  newPassword: string;
}

interface GeminiLogData {
  requestType: string;
  prompt: string;
  response: string;
  model: string;
  status: 'success' | 'error';
  errorMessage?: string;
  metadata?: any;
  timestamp?: number;
}

// メール送信関数（共通ロジック）
const sendVerificationEmailApp = async (req: functions.https.Request, res: any) => {
  // CORS設定
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ error: 'メールアドレスと確認コードが必要です' });
    return;
  }

  // シークレットの確認
  const gmailEmail = process.env.GMAIL_EMAIL;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailEmail || !gmailPassword) {
    console.error('Gmail credentials not found in environment variables');
    res.status(500).json({ error: 'サーバー設定エラー: メール認証情報が不足しています' });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailEmail,
      pass: gmailPassword,
    },
  });

  const mailOptions = {
    from: '"けんすけ" <noreply@life-pwa.app>',
    to: email,
    subject: '【けんすけ】メールアドレスの確認',
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4caf50;
      font-size: 24px;
      margin: 0;
    }
    .code-box {
      background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      margin: 10px 0;
    }
    .info {
      background-color: #fff3cd;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
    .warning {
      color: #f44336;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🥗💰 けんすけ</h1>
      <p>メールアドレス確認</p>
    </div>

    <p>こんにちは！</p>
    <p>けんすけへのご登録ありがとうございます。</p>
    <p>以下の確認コードを入力して、メールアドレスの確認を完了してください：</p>

    <div class="code-box">
      <div>確認コード</div>
      <div class="code">${code}</div>
    </div>

    <div class="info">
      <p><strong>ご注意：</strong></p>
      <ul>
        <li>このコードは <span class="warning">10分間</span> 有効です</li>
        <li>このメールに心当たりがない場合は、無視していただいて構いません</li>
        <li>確認コードは他人に教えないでください</li>
      </ul>
    </div>

    <div class="footer">
      <p>© 2025 けんすけ</p>
      <p><a href="https://healthfinanse.jp" style="color: #4caf50; text-decoration: none;">https://healthfinanse.jp</a></p>
      <p>このメールは自動送信されています。返信はできません。</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
けんすけ - メールアドレス確認

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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error sending email:', error);
    const errorMessage = error.message || 'メール送信に失敗しました';
    res.status(500).json({ error: `メール送信に失敗しました: ${errorMessage}` });
  }
};

export const sendVerificationEmailV2 = functions.https.onRequest(
  {
    region: 'us-central1',
    secrets: ['GMAIL_EMAIL', 'GMAIL_APP_PASSWORD'],
  },
  sendVerificationEmailApp
);

export const sendPasswordResetEmail = functions.https.onCall(
  {
    region: 'us-central1',
    secrets: ['GMAIL_EMAIL', 'GMAIL_APP_PASSWORD'],
  },
  async (request: functions.https.CallableRequest<SendVerificationEmailData>) => {
    const { email, code } = request.data;
    if (!email || !code) {
      throw new functions.https.HttpsError('invalid-argument', 'メールアドレスと確認コードが必要です');
    }

    const gmailEmail = process.env.GMAIL_EMAIL;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailEmail || !gmailPassword) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Gmail認証情報が設定されていません。管理者に連絡してください。'
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailEmail,
        pass: gmailPassword,
      },
    });

    const mailOptions = {
      from: '"けんすけ" <noreply@life-pwa.app>',
      to: email,
      subject: '【けんすけ】パスワードリセット',
      html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4caf50;
      font-size: 24px;
      margin: 0;
    }
    .code-box {
      background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      margin: 10px 0;
    }
    .info {
      background-color: #fff3cd;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
    .warning {
      color: #f44336;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🥗💰 けんすけ</h1>
      <p>パスワードリセット</p>
    </div>

    <p>こんにちは！</p>
    <p>パスワードのリセットをリクエストいただきありがとうございます。</p>
    <p>以下の確認コードを入力して、パスワードのリセットを完了してください：</p>

    <div class="code-box">
      <div>確認コード</div>
      <div class="code">${code}</div>
    </div>

    <div class="info">
      <p><strong>ご注意：</strong></p>
      <ul>
        <li>このコードは <span class="warning">10分間</span> 有効です</li>
        <li>このメールに心当たりがない場合は、無視していただいて構いません</li>
        <li>確認コードは他人に教えないでください</li>
      </ul>
    </div>

    <div class="footer">
      <p>© 2025 けんすけ</p>
      <p><a href="https://healthfinanse.jp" style="color: #4caf50; text-decoration: none;">https://healthfinanse.jp</a></p>
      <p>このメールは自動送信されています。返信はできません。</p>
    </div>
  </div>
</body>
</html>
      `,
      text: `
けんすけ - パスワードリセット

こんにちは！

パスワードのリセットをリクエストいただきありがとうございます。

以下の確認コードを入力して、パスワードのリセットを完了してください：

確認コード: ${code}

※ このコードは10分間有効です。
※ このメールに心当たりがない場合は、無視していただいて構いません。

━━━━━━━━━━━━━━━━━━━━━━━━

© 2025 けんすけ
https://healthfinanse.jp
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      const errorMessage = error.message || 'パスワードリセットメール送信に失敗しました';
      throw new functions.https.HttpsError('internal', `パスワードリセットメール送信に失敗しました: ${errorMessage}`);
    }
  }
);

export const resetPassword = functions.https.onCall(
  { region: 'us-central1' },
  async (request: functions.https.CallableRequest<ResetPasswordData>) => {
    const { email, newPassword } = request.data;
    if (!email || !newPassword) {
      throw new functions.https.HttpsError('invalid-argument', 'メールアドレスと新しいパスワードが必要です');
    }
    if (newPassword.length < 6) {
      throw new functions.https.HttpsError('invalid-argument', 'パスワードは6文字以上で入力してください');
    }
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(userRecord.uid, { password: newPassword });
      console.log(`Password reset successful for user: ${userRecord.uid}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      if (error.code === 'auth/user-not-found') {
        throw new functions.https.HttpsError('not-found', 'ユーザーが見つかりません');
      }
      throw new functions.https.HttpsError('internal', 'パスワードのリセットに失敗しました');
    }
  }
);

async function deleteCollection(collectionPath: string, batchSize: number) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);
  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: (value?: unknown) => void) {
  const snapshot = await query.get();
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

export const deleteAllFollows = functions.https.onCall({ timeoutSeconds: 540, memory: '1GiB', region: 'us-central1' }, async (request: functions.https.CallableRequest) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  console.log('Starting to delete all follow/following relationships.');
  const usersSnapshot = await db.collection('users').get();
  for (const userDoc of usersSnapshot.docs) {
    await deleteCollection(`users/${userDoc.id}/followers`, 100);
    await deleteCollection(`users/${userDoc.id}/following`, 100);
    const profileRef = db.doc(`users/${userDoc.id}/profile/data`);
    try {
      await profileRef.update({
        'stats.followerCount': 0,
        'stats.followingCount': 0,
      });
    } catch (e) {
      console.log(`Could not update stats for user ${userDoc.id}, probably stats field does not exist.`);
    }
  }
  console.log('Finished deleting all follow/following relationships and resetting stats.');
  return { result: 'All follow data deleted successfully.' };
});

export const deleteAllPosts = functions.https.onCall({ timeoutSeconds: 540, memory: '1GiB', region: 'us-central1' }, async (request: functions.https.CallableRequest) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  console.log('Starting to delete all posts and their subcollections.');
  const postsSnapshot = await db.collection('posts').get();
  for (const postDoc of postsSnapshot.docs) {
    await deleteCollection(`posts/${postDoc.id}/likes`, 100);
    await deleteCollection(`posts/${postDoc.id}/comments`, 100);
    await deleteCollection(`posts/${postDoc.id}/reposts`, 100);
    await postDoc.ref.delete();
  }
  const usersSnapshot = await db.collection('users').get();
  for (const userDoc of usersSnapshot.docs) {
    const profileRef = db.doc(`users/${userDoc.id}/profile/data`);
    try {
      await profileRef.update({ 'stats.postCount': 0 });
    } catch (e) {
      console.log(`Could not update stats for user ${userDoc.id}, probably stats field does not exist.`);
    }
  }
  console.log('Finished deleting all posts and resetting post counts.');
  return { result: 'All posts deleted successfully.' };
});

export const logGeminiInteraction = functions.https.onCall(
  { region: 'us-central1' },
  async (request: functions.https.CallableRequest<GeminiLogData>) => {
    const { requestType, prompt, response, model, status, errorMessage, metadata, timestamp } = request.data;
    const userId = request.auth?.uid || 'anonymous';

    const row = {
      timestamp: getBigQuery().timestamp(new Date(timestamp || Date.now())),
      user_id: userId,
      request_type: requestType,
      prompt: prompt,
      response: response,
      model: model,
      status: status,
      error_message: errorMessage || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      created_at: getBigQuery().timestamp(new Date()),
    };

    try {
      await getBigQuery()
        .dataset(DATASET_ID)
        .table(TABLE_ID)
        .insert([row]);

      console.log('Logged Gemini interaction to BigQuery');
      return { success: true };
    } catch (error) {
      console.error('Error logging to BigQuery:', error);
      return { success: false, error: 'Logging failed' };
    }
  }
);

export const getFewShotExamples = functions.https.onCall(
  { region: 'us-central1' },
  async (request: functions.https.CallableRequest<{ requestType: string; limit?: number }>) => {
    const { requestType, limit = 3 } = request.data;

    if (!requestType) {
      throw new functions.https.HttpsError('invalid-argument', 'Request type is required');
    }

    const query = `
      SELECT prompt, response
      FROM \`${DATASET_ID}.${TABLE_ID}\`
      WHERE request_type = @requestType
        AND status = 'success'
        AND error_message IS NULL
      ORDER BY created_at DESC
      LIMIT @limit
    `;

    const options = {
      query: query,
      params: { requestType, limit },
    };

    try {
      const [rows] = await getBigQuery().query(options);
      return { examples: rows };
    } catch (error) {
      console.error('Error fetching examples from BigQuery:', error);
      return { examples: [] };
    }
  }
);

export * from './vision';
export * from './notifications';
export * from './stripe';

// Gemini functions - exported last to ensure admin is initialized
export * from './gemini';
