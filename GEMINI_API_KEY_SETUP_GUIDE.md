# Gemini APIキーの設定方法ガイド

## 📋 現在の実装状況

### 問題点

1. **APIキーがコード内に直接ハードコードされている**
   - セキュリティリスク（GitHubに公開される可能性）
   - コードを変更しないとAPIキーを更新できない

2. **Viteの環境変数の制限**
   - Viteの環境変数（`VITE_*`）はビルド時に埋め込まれる
   - 本番環境で実行時に変更できない
   - Firebase Hostingでは環境変数を直接設定できない

3. **現在の実装**
   ```typescript
   // コード内に直接記述（非推奨）
   const defaultKey = 'AIzaSyDL7jV9ZpXJVqQY05BdkP2qfP_3LczPO2M';
   ```

## ✅ 推奨される方法

### 方法1: Google AI StudioからAPIキーを取得（現在の方法）

**手順:**
1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. 「Create API Key」をクリック
3. プロジェクトを選択（または新規作成）
4. APIキーが生成される
5. コピーして保存

**注意点:**
- APIキーは一度しか表示されないため、必ずコピーして保存
- APIキーは秘密情報として扱う

### 方法2: Google Cloud Consoleから取得（より詳細な設定が可能）

**手順:**
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「ライブラリ」で「Generative Language API」を検索して有効化
4. 「APIとサービス」→「認証情報」で「認証情報を作成」→「APIキー」
5. APIキーに制限を設定（推奨）:
   - **アプリケーションの制限**: HTTPリファラー（ウェブサイト）
   - **APIの制限**: Generative Language APIのみ

**メリット:**
- APIキーに制限を設定できる（セキュリティ向上）
- 使用量の監視が可能
- 複数のAPIキーを管理できる

## 🔧 現在のアプリケーションでの実装

### 運営者APIキー（全ユーザーが使用）

現在はコード内に直接記述されていますが、以下の方法が推奨されます：

#### オプションA: Firestoreの管理者コレクションに保存（推奨）

```typescript
// Firestoreに管理者専用のコレクションを作成
// collection: 'admin'
// document: 'config'
// field: 'geminiApiKey'

// コード側で取得
async function getOperatorApiKey(): Promise<string | null> {
  try {
    const doc = await getDoc(doc(db, 'admin', 'config'));
    return doc.data()?.geminiApiKey || null;
  } catch (error) {
    console.error('Failed to get operator API key:', error);
    return null;
  }
}
```

**メリット:**
- コードを変更せずにAPIキーを更新できる
- Firestoreのセキュリティルールでアクセス制限可能
- 管理者のみが更新可能

**デメリット:**
- Firestoreへの読み取りが発生（パフォーマンスへの影響は軽微）

#### オプションB: Firebase Functions経由でAPIキーを管理

```typescript
// Firebase FunctionsでSecret Managerを使用
// functions/src/index.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export const getGeminiApiKey = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({
    name: 'projects/oshi-para/secrets/gemini-api-key/versions/latest',
  });
  
  return { apiKey: version.payload?.data?.toString() };
});
```

**メリット:**
- 最もセキュアな方法
- APIキーがクライアント側に露出しない

**デメリット:**
- 実装が複雑
- Firebase Functionsのコストが発生

#### オプションC: 現在の方法（コード内に記述）

**メリット:**
- 実装が簡単
- 追加のコストなし

**デメリット:**
- セキュリティリスク（APIキーがコードに含まれる）
- APIキーを変更するにはコードを変更して再デプロイが必要

### ユーザーAPIキー（各ユーザーが設定）

現在の実装は適切です：
- 設定画面でユーザーが入力
- Firestoreに保存（ユーザーごと）
- プライバシーが保護される

## 🎯 推奨される改善案

### 短期対応（すぐに実装可能）

1. **Firestoreの管理者コレクションにAPIキーを保存**
   - セキュリティルールで管理者のみアクセス可能に設定
   - コードからFirestoreを読み取る

2. **APIキーのローテーション機能を追加**
   - 管理者がFirestoreからAPIキーを更新できる
   - コードの変更なしで更新可能

### 長期対応（よりセキュア）

1. **Firebase Functions経由でAPIキーを管理**
   - Secret Managerを使用
   - APIキーがクライアント側に露出しない

2. **APIキーの使用量監視**
   - Google Cloud Consoleで使用量を監視
   - 異常な使用を検知

## 📝 現在のAPIキー取得方法の確認

### Google AI Studioから取得する場合

1. https://aistudio.google.com/app/apikey にアクセス
2. 「Create API Key」をクリック
3. プロジェクトを選択
4. APIキーが生成される（形式: `AIzaSy...`）

### Google Cloud Consoleから取得する場合

1. https://console.cloud.google.com/ にアクセス
2. プロジェクトを作成/選択
3. 「APIとサービス」→「ライブラリ」
4. 「Generative Language API」を検索して有効化
5. 「APIとサービス」→「認証情報」→「認証情報を作成」→「APIキー」
6. APIキーに制限を設定（推奨）

## ⚠️ セキュリティ上の注意点

1. **APIキーは秘密情報**
   - GitHubなどの公開リポジトリにコミットしない
   - `.env`ファイルは`.gitignore`に含める

2. **APIキーの制限設定**
   - HTTPリファラーを設定（特定のドメインからのみアクセス可能）
   - APIの制限を設定（Generative Language APIのみ）

3. **定期的なローテーション**
   - 定期的にAPIキーを更新
   - 古いAPIキーは無効化

## 🔍 現在の実装の確認

現在のコードでは、以下の順序でAPIキーを取得しています：

1. **環境変数** (`VITE_GEMINI_API_KEY`) - ローカル開発環境用
2. **デフォルト値** (コード内に記述) - 本番環境用
3. **ユーザー設定** (Firestore) - ユーザーが設定したAPIキー

ユーザーAPIキーが設定されている場合、それが優先的に使用されます。


