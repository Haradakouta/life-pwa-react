# 🔐 Firebase セキュリティルール デプロイガイド

このドキュメントは、本番環境用のFirestoreおよびFirebase Storageセキュリティルールのデプロイ方法を説明しています。

---

## 📋 対応ファイル

| ファイル | 役割 | デプロイ方法 |
|---------|------|-----------|
| `firestore.rules` | Firestore Database セキュリティルール | Firebase CLI |
| `storage.rules` | Firebase Storage セキュリティルール | Firebase Console |

---

## 🚀 Firestore セキュリティルールのデプロイ

### 方法1: Firebase CLI を使用（推奨）

```bash
# Firebaseプロジェクトにログイン（初回のみ）
firebase login

# 現在のFirebaseプロジェクトを確認
firebase projects:list

# Firestoreセキュリティルールをデプロイ
firebase deploy --only firestore:rules
```

**出力例:**
```
i  deploying firestore
i  verifying firestore.rules...
✔  rules file validated

i  uploading rules...
✔  firestore: rules have been successfully published for database: (default)
```

### 方法2: Firebase Console を使用

1. [Firebase Console](https://console.firebase.google.com) にアクセス
2. プロジェクト名をクリック
3. **Firestore Database** を選択
4. **ルール** タブをクリック
5. `firestore.rules` ファイルの内容を全てコピー
6. ルールエディタに貼り付け
7. **公開** をクリック

---

## 🚀 Firebase Storage セキュリティルールのデプロイ

### 注意⚠️
Firebase Storage ルールは **Firebase CLI でのみデプロイ可能** です。Firebase Console からは直接デプロイできません。

### デプロイ手順

```bash
# Storage セキュリティルールをデプロイ
firebase deploy --only storage
```

**出力例:**
```
i  deploying storage
i  uploading rules...
✔  storage: rules have been successfully published for default bucket
```

### Firebase Console での確認

1. **Storage** セクションを選択
2. **ルール** タブをクリック
3. デプロイされたルールが表示されることを確認

---

## 📝 セキュリティルール概要

### Firestore ルール（firestore.rules）

#### パート1: ユーザーデータ分離
```javascript
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
- **対象**: プロフィール、設定、食事記録、支出、在庫、買い物リスト、レシピなど
- **セキュリティ**: 各ユーザーは自分のデータのみアクセス可能

#### パート2: 認証関連
```javascript
match /verificationCodes/{email} {
  allow read, write: if true;
}
```
- **対象**: メール確認コード、パスワードリセットコード
- **セキュリティ**: Cloud Functions で期限管理（10分）

#### パート3: ソーシャル投稿
```javascript
match /posts/{postId} {
  allow read: if resource.data.visibility == 'public'
              || (isAuth() && resource.data.visibility == 'followers')
              || (isAuthor(resource.data.authorId));
}
```
- **機能**: 投稿作成、いいね、コメント、リポスト、ブックマーク
- **公開範囲**: public（全員）/ followers（フォロワーのみ）/ private（作成者のみ）

#### パート4: フォロー機能
```javascript
match /users/{userId}/followers/{followId} {
  allow delete: if resource.data.followerId == request.auth.uid;
}
```
- **機能**: フォロー、アンフォロー
- **セキュリティ**: フォローしたユーザー本人のみ削除可能

#### パート5: レシピ共有
```javascript
match /recipes/{recipeId} {
  // 投稿と同じ公開範囲設定
}
```
- **機能**: レシピ投稿、コメント、いいね
- **公開範囲**: 投稿と同様

#### パート6: ランキング（読み取り専用）
```javascript
match /rankings/posts {
  allow read: if true;
  allow write: if false;
}
```
- **用途**: 人気投稿、人気レシピの集計
- **更新**: Cloud Functions で自動更新

### Firebase Storage ルール（storage.rules）

#### ユーザープロフィール画像
- **アバター**: `users/{userId}/profile/avatar/*`
  - 読み取り: 認証済みユーザーのみ
  - アップロード: 自分のアバターのみ（10MB以下）
  - 形式: JPEG, PNG, GIF, WebP

- **カバー**: `users/{userId}/profile/cover/*`
  - 読み取り: 認証済みユーザーのみ
  - アップロード: 自分のカバーのみ（10MB以下）
  - 形式: JPEG, PNG, GIF, WebP

#### 投稿・レシピ画像
- **投稿**: `posts/{postId}/*`
  - アップロード: 認証済みユーザーのみ（15MB以下）
  - 読み取り: 認証済みユーザーのみ

- **レシピ**: `recipes/{recipeId}/*`
  - アップロード: 認証済みユーザーのみ（15MB以下）
  - 読み取り: 認証済みユーザーのみ

---

## 🔍 ルール検証

### Firebase Console での検証

1. **Firestore ルール検証**
   - Firestore → ルール → 「検証」ボタンをクリック
   - 構文エラーが表示されます

2. **Storage ルール検証**
   - Storage → ルール → 「検証」ボタンをクリック
   - 構文エラーが表示されます

### CLI での検証

```bash
# Firebase CLI で構文チェック（自動で実行される）
firebase deploy --only firestore:rules --dry-run
firebase deploy --only storage --dry-run
```

---

## ⚙️ ユーティリティ関数

### Firestore ルールで使用

```javascript
function isAuth() {
  return request.auth != null;
}

function isOwner(userId) {
  return isAuth() && request.auth.uid == userId;
}

function isAuthor(authorId) {
  return isAuth() && request.auth.uid == authorId;
}
```

これらの関数により、ルールが読みやすく、保守しやすくなります。

---

## 🛡️ セキュリティのベストプラクティス

### 1. 認証の確認
```javascript
// ✅ 良い例: 認証確認後、ユーザーIDチェック
allow create: if isAuth() && request.resource.data.userId == request.auth.uid;

// ❌ 悪い例: 認証確認なし
allow create: if request.resource.data.userId == request.auth.uid;
```

### 2. 公開範囲の尊重
```javascript
// ✅ 良い例: visibility フィールドで制御
allow read: if resource.data.visibility == 'public'
            || (isAuth() && resource.data.visibility == 'followers');

// ❌ 悪い例: すべてのデータを読み取り許可
allow read: if true;
```

### 3. 削除権限の制限
```javascript
// ✅ 良い例: 自分のデータのみ削除可能
allow delete: if isAuth() && resource.data.userId == request.auth.uid;

// ❌ 悪い例: 認証済みユーザーなら何でも削除可能
allow delete: if isAuth();
```

### 4. ファイルサイズ制限
```javascript
// ✅ 良い例: 10MB以下に制限
allow create: if request.resource.size < 10 * 1024 * 1024;

// ❌ 悪い例: サイズ制限なし
allow create: if true;
```

### 5. ファイル形式制限
```javascript
// ✅ 良い例: 許可形式のみ
allow create: if request.resource.contentType in ['image/jpeg', 'image/png'];

// ❌ 悪い例: すべての形式を許可
allow create: if true;
```

---

## 🐛 よくあるエラーと解決方法

### エラー: "Permission denied"

**原因**: ユーザーがデータへのアクセス権がない

**解決**:
1. ルールで `request.auth.uid` が正しいか確認
2. ユーザーがログイン状態か確認
3. `request.auth != null` チェックがあるか確認

```javascript
// 修正例
allow read: if request.auth != null && request.auth.uid == resource.data.userId;
```

### エラー: "Invalid rules"

**原因**: Firestore ルール構文エラー

**解決**:
1. `--dry-run` で検証: `firebase deploy --only firestore:rules --dry-run`
2. Firebase Console でルール検証ボタンを使用
3. 括弧、セミコロンを確認

### エラー: Storage アップロード失敗

**原因**: Storage ルールでアップロード許可がない

**解決**:
1. ルールが `allow create` を含むか確認
2. ファイルサイズが制限以下か確認
3. ファイル形式が許可リストに含まれているか確認

```javascript
// 修正例
allow create: if request.auth != null
              && request.resource.size < 10 * 1024 * 1024
              && request.resource.contentType in ['image/jpeg', 'image/png'];
```

---

## 📊 本番環境チェックリスト

デプロイ前に以下を確認してください:

- [ ] `.firebaserc` ファイルが正しいプロジェクトIDを指す
- [ ] `firebase login` でログイン済み
- [ ] `firestore.rules` ファイルが存在
- [ ] `storage.rules` ファイルが存在
- [ ] ローカルで `--dry-run` で検証済み
- [ ] テストデータで動作確認済み
- [ ] Firestore ルール構文エラーなし
- [ ] Storage ルール構文エラーなし
- [ ] バックアップを取得済み（必要に応じて）

---

## 🔄 ロールバック手順

ルール変更後に問題が発生した場合:

### Firestore ロールバック

```bash
# 前のバージョンを確認
firebase firestore:backups:list --location=asia-northeast1

# バックアップから復元（必要に応じて）
firebase firestore:backups:restore <backup-id>
```

### Storage ロールバック

```bash
# 前のルールをGit履歴から取得して再デプロイ
git checkout HEAD~1 storage.rules
firebase deploy --only storage

# 元に戻す
git checkout storage.rules
firebase deploy --only storage
```

---

## 📞 トラブルシューティング

### Q: Firebase CLI がインストールされていない

```bash
npm install -g firebase-tools
```

### Q: プロジェクトIDがわかりません

```bash
firebase projects:list
```

### Q: デプロイ権限がない

Firebase Console で **Firestore Editor** または **Editor** ロールが必要です。

1. Firebase Console → Project Settings → Members
2. ユーザーのロールを確認・変更

---

## 📚 参考資料

- [Firebase Firestore セキュリティルール公式ドキュメント](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Storage セキュリティルール公式ドキュメント](https://firebase.google.com/docs/storage/security/start)
- [Firebase CLI リファレンス](https://firebase.google.com/docs/cli)
- [Firebase セキュリティベストプラクティス](https://firebase.google.com/docs/rules/best-practices)

---

## ✅ デプロイ完了後

デプロイ完了後は、アプリが以下の機能を正常に実行できることを確認してください:

- [ ] ユーザー登録・ログイン
- [ ] プロフィール画像アップロード
- [ ] 投稿作成・表示
- [ ] いいね・コメント機能
- [ ] フォロー・アンフォロー
- [ ] レシピ共有機能
- [ ] 個人用データへのアクセス（他ユーザーデータは非表示）

すべてが正常に動作していれば、セキュリティルールのデプロイは成功です！ 🎉
