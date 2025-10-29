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

### 3. Firestore ルールをデプロイ

```bash
firebase deploy --only firestore:rules
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

### 2025-10-29 (セッション継続)

**変更内容:**
- 投稿作成時に `quotedPostId`, `recipeData`, `mentions` フィールドを許可
- 必須フィールドのバリデーション追加（`content`, `authorId`, `authorName`, `visibility`）
- `visibility` の値検証（`public`, `followers`, `private` のみ許可）

**影響する機能:**
- 引用リポスト機能
- レシピ添付機能
- メンション機能

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
