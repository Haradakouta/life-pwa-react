# エラーログ自動取得ガイド

**作成日**: 2025-01-28
**目的**: アプリのエラーログを自動でFirestoreに保存する機能

---

## 📊 実装内容

### 1. エラーログの自動保存

エラーが発生すると、自動的にFirestoreの`errorLogs`コレクションに保存されます。

#### 保存される情報
- **エラーメッセージ**: エラーの内容
- **スタックトレース**: エラーが発生した場所
- **URL**: エラーが発生したページのURL
- **ユーザーエージェント**: ブラウザ情報
- **ユーザーID**: ログイン中のユーザー（未ログインの場合はnull）
- **タイムスタンプ**: エラーが発生した日時
- **エラータイプ**: `error` / `unhandledRejection` / `resourceError`

#### 捕捉されるエラー
1. **JavaScriptエラー**: `window.onerror`で捕捉
2. **未処理のPromise拒否**: `unhandledrejection`イベントで捕捉
3. **リソース読み込みエラー**: 画像・スクリプトなどの読み込み失敗

---

## 🔍 エラーログの確認方法

### Firebase Consoleで確認

1. **Firebase Console**を開く
   - プロジェクト: `oshi-para`
   - URL: https://console.firebase.google.com/project/oshi-para

2. **Firestore Database**を開く
   - 左サイドバーから「Firestore Database」を選択

3. **errorLogsコレクション**を確認
   - コレクション一覧から「errorLogs」を選択
   - エラーログの一覧が表示されます

4. **エラーログの詳細を確認**
   - 各ドキュメントをクリックして詳細を確認
   - `message`: エラーメッセージ
   - `stack`: スタックトレース
   - `url`: エラーが発生したURL
   - `userAgent`: ブラウザ情報
   - `userId`: ユーザーID（未ログインの場合はnull）
   - `timestamp`: エラーが発生した日時

---

## 📋 エラーログの構造

```typescript
{
  message: string;              // エラーメッセージ
  stack?: string;              // スタックトレース
  url: string;                 // エラーが発生したURL
  userAgent: string;           // ブラウザ情報
  userId?: string;            // ユーザーID（未ログインの場合はnull）
  timestamp: string;           // エラーが発生した日時
  errorType: 'error' | 'unhandledRejection' | 'resourceError';
  resourceUrl?: string;        // リソースエラーの場合のURL
  createdAt: string;           // Firestoreに保存された日時
}
```

---

## 🛠️ 手動でエラーをログに記録

コード内でエラーを手動でログに記録することもできます：

```typescript
import { logManualError } from './utils/errorLogger';

try {
  // 何らかの処理
} catch (error) {
  logManualError('処理に失敗しました', error);
}
```

---

## 🔒 セキュリティルール

Firestoreのセキュリティルールで、エラーログは以下のように設定されています：

```javascript
match /errorLogs/{logId} {
  allow create: if true; // 誰でもエラーログを書き込める
  allow read: if isAuth(); // 認証済みユーザーは読み取り可能
  allow update, delete: if false; // 更新・削除は不可
}
```

- **書き込み**: 誰でも可能（エラーログは未ログインユーザーでも発生するため）
- **読み取り**: 認証済みユーザーのみ（管理者のみを想定）
- **更新・削除**: 不可（ログの改ざんを防止）

---

## 📊 エラーログの分析

### よくあるエラーの確認

1. **404エラー**: リソースが見つからない
   - `errorType: 'resourceError'`
   - `resourceUrl`でどのリソースが読み込めなかったか確認

2. **JavaScriptエラー**: コードのバグ
   - `errorType: 'error'`
   - `stack`でエラーが発生した場所を確認

3. **Promise拒否**: 非同期処理のエラー
   - `errorType: 'unhandledRejection'`
   - `message`でエラーの内容を確認

### ユーザー別のエラー確認

- `userId`でフィルタリングして、特定のユーザーで発生しているエラーを確認

### 時間別のエラー確認

- `timestamp`でソートして、最近発生したエラーを確認

---

## 🚀 今後の拡張

### 1. エラー通知機能
- 重大なエラーが発生した場合、管理者に通知を送信

### 2. エラー集計機能
- 同じエラーが複数回発生した場合、集計して表示

### 3. エラー分析ダッシュボード
- BigQueryと連携して、エラーの傾向を分析

---

## 📚 参考資料

- [Firestore ドキュメント](https://firebase.google.com/docs/firestore)
- [JavaScript Error Handling](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)

