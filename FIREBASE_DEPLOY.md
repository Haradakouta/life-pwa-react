# 🔥 Firebase デプロイ手順

## ⚠️ 重要: Firestore ルールのデプロイが必要です

フロントエンドの変更をGitHub Pagesにデプロイした後、**必ず**Firestoreセキュリティルールを別PCでデプロイしてください。

---

## 📋 デプロイが必要な場合

以下のような変更を行った場合、Firestoreルールのデプロイが必要です：

- ✅ 新しいフィールドを投稿に追加（例: `quotedPostId`, `recipeData`, `mentions`）
- ✅ 新しいコレクションやサブコレクションを追加
- ✅ セキュリティルールの変更
- ✅ バリデーションルールの追加・変更

---

## 🚀 デプロイ手順（別PCで実行）

### 1. Firebase CLI にログイン

```bash
firebase login
```

- ブラウザが開き、Googleアカウントでログインを求められます
- ログイン後、ターミナルに戻ります

### 2. プロジェクトを確認

```bash
firebase projects:list
```

- 現在のプロジェクト: `oshi-para`

### 3. すべてのルールをデプロイ

```bash
# Firestore + Storage ルールを一括デプロイ
firebase deploy --only firestore:rules,storage:rules
```

**または個別にデプロイ:**

```bash
# Firestore ルールのみ
firebase deploy --only firestore:rules

# Storage ルールのみ
firebase deploy --only storage:rules
```

### 4. Storage CORS 設定をデプロイ

```bash
# Google Cloud SDK (gcloud) をインストール（初回のみ）
# https://cloud.google.com/sdk/docs/install

# プロジェクトを設定
gcloud config set project oshi-para

# CORS設定を適用
gsutil cors set cors.json gs://oshi-para.firebasestorage.app
```

**成功メッセージ例:**
```
Setting CORS on gs://oshi-para.firebasestorage.app/...
```

### 5. CORS 設定の確認

```bash
# 現在のCORS設定を確認
gsutil cors get gs://oshi-para.firebasestorage.app
```

**成功メッセージ例:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/oshi-para/overview
```

---

## 🔍 デプロイ確認方法

### 1. Firebase Console で確認

1. https://console.firebase.google.com/project/oshi-para/firestore/rules に移動
2. 最新のルールが反映されているか確認
3. 「公開日時」が最新になっているか確認

### 2. アプリで動作確認

1. https://haradakouta.github.io/life-pwa-react/ を開く
2. ログイン
3. 以下の機能をテスト：
   - ✅ 投稿作成
   - ✅ 引用リポスト
   - ✅ レシピ添付
   - ✅ メンション（@username）
   - ✅ いいね・コメント・リポスト
   - ✅ プロフィール編集

---

## ⚠️ トラブルシューティング

### エラー: `Error: Failed to authenticate`

**解決策:**
```bash
firebase logout
firebase login
```

### エラー: `Permission denied`

**解決策:**
- Firebase Console で権限を確認
- プロジェクトオーナーまたはエディター権限が必要

### エラー: `firestore.rules not found`

**解決策:**
- プロジェクトのルートディレクトリで実行しているか確認
- `ls firestore.rules` でファイルの存在を確認

---

## 📝 最近の変更内容

### 2025-10-29 (セッション継続) - CORS & Storage Rules 修正

**Firestore Rules 変更:**
- 投稿作成時に `quotedPostId`, `recipeData`, `mentions` フィールドを許可
- 必須フィールドのバリデーション追加（`content`, `authorId`, `authorName`, `visibility`）
- `visibility` の値検証（`public`, `followers`, `private` のみ許可）

**Storage Rules 変更:**
- ❗ **重要:** パス構造を修正してコードと一致させました
  - アバター画像: `users/{userId}/profile/avatar/` → `avatars/{userId}/`
  - カバー画像: `users/{userId}/profile/cover/` → `covers/{userId}/`
  - 投稿画像: `posts/{postId}/` → `posts/{userId}/`
  - レシピ画像: `recipes/{recipeId}/` → `recipes/{userId}/`
- すべての画像の読み取りを公開に変更（`allow read: if true`）

**CORS 設定追加:**
- `cors.json` ファイルを作成
- `https://haradakouta.github.io` からのアクセスを許可
- GET, POST, PUT, DELETE, OPTIONS メソッドを許可

**影響する機能:**
- ✅ 引用リポスト機能
- ✅ レシピ添付機能
- ✅ メンション機能
- ✅ プロフィール画像アップロード（CORS エラー修正）
- ✅ 投稿画像アップロード

---

## 🔗 関連リンク

- Firebase Console: https://console.firebase.google.com/project/oshi-para
- GitHub Pages: https://haradakouta.github.io/life-pwa-react/
- GitHub Repository: https://github.com/Haradakouta/life-pwa-react

---

## 💡 今後の改善案

- CI/CD パイプラインの構築（GitHub ActionsでFirebaseルールを自動デプロイ）
- ステージング環境の構築
- Firebaseエミュレータを使ったローカルテスト
