# 🔐 セキュリティルール クイックリファレンス

このドキュメントは、Firebase セキュリティルールの **コピー&ペースト用の実行手順** です。
3ステップで本番環境対応のセキュリティルールをデプロイできます。

---

## ⚡ 3ステップデプロイ

### ステップ1: Firebase CLI セットアップ

```bash
# まだインストールしていない場合
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクト確認
firebase projects:list
```

### ステップ2: ドライラン（確認）

```bash
# Firestore ルール確認
firebase deploy --only firestore:rules --dry-run

# Storage ルール確認
firebase deploy --only storage --dry-run

# 両方確認
firebase deploy --only firestore:rules,storage --dry-run
```

### ステップ3: 本番デプロイ

```bash
# Firestore をデプロイ
firebase deploy --only firestore:rules

# Storage をデプロイ
firebase deploy --only storage

# または両方一度に
firebase deploy --only firestore:rules,storage
```

**完了メッセージ**:
```
✔  firestore: rules have been successfully published for database: (default)
✔  storage: rules have been successfully published for default bucket
```

---

## 📝 ファイルリスト

| ファイル | 説明 | デプロイ対象 |
|---------|------|----------|
| `firestore.rules` | Firestore Database ルール | ✅ Firebase CLI |
| `storage.rules` | Firebase Storage ルール | ✅ Firebase CLI |
| `FIREBASE_RULES_DEPLOYMENT.md` | 詳細デプロイガイド | 📖 参考 |
| `PRODUCTION_SECURITY_RULES_SUMMARY.md` | 完全ドキュメント | 📖 参考 |
| `SECURITY_RULES_QUICK_REFERENCE.md` | このファイル | 📖 参考 |

---

## 🔑 主要なセキュリティルール

### Firestore: ユーザーデータ分離
```javascript
match /users/{userId}/{document=**} {
  allow read, write: if request.auth.uid == userId;
}
```
✅ 各ユーザーは自分のデータのみアクセス可能

### Firestore: 公開投稿
```javascript
match /posts/{postId} {
  allow read: if resource.data.visibility == 'public';
}
```
✅ visibility == 'public' の投稿なら誰でも閲覧可能

### Firestore: 投稿作成
```javascript
allow create: if request.auth != null
              && request.resource.data.authorId == request.auth.uid;
```
✅ 認証済みユーザーのみ、かつ自分の投稿のみ作成可能

### Storage: 画像アップロード制限
```javascript
allow create: if request.auth != null
              && request.resource.size < 10 * 1024 * 1024
              && request.resource.contentType in ['image/jpeg', 'image/png'];
```
✅ 10MB以下、JPEG/PNG形式のみアップロード可能

---

## 🧪 デプロイ後のテスト

### テスト1: 自分の投稿が作成できるか

```javascript
// フロントエンド
await createPost({
  content: "Hello World",
  authorId: auth.currentUser.uid,
  visibility: "public"
});

// 期待: ✅ 成功
```

### テスト2: 公開投稿が見えるか

```javascript
// 他ユーザーがアクセス
const post = await getDoc(doc(db, 'posts', postId));

// 期待: ✅ visibility == 'public' なら表示
```

### テスト3: 他人の投稿が削除できないか

```javascript
// 他ユーザーが削除試行
await deleteDoc(doc(db, 'posts', otherUserPostId));

// 期待: ❌ Permission denied エラー
```

### テスト4: 画像が10MB制限で拒否されるか

```javascript
// 15MB の画像をアップロード
const largeFile = new File([...], 'large.jpg', { type: 'image/jpeg' });

await uploadBytes(storageRef, largeFile);

// 期待: ❌ Request size exceeds allowed limits エラー
```

---

## ⚠️ よくある質問（FAQ）

### Q1: デプロイ後、「Permission denied」が出る

**A**: ログインしているか確認してください。
```javascript
const user = auth.currentUser;
if (!user) {
  // ログインしていない
  console.log('ログインしてください');
}
```

### Q2: 他ユーザーのプロフィール画像が見えない

**A**: これは正常です。設定に応じて以下のいずれかです:
- プロフィール画像がない
- Storage ルールで読み取り制限されている
- プロフィール公開設定が OFF

### Q3: 投稿作成時に authorId が必須と言われる

**A**: フロントエンド側で authorId を設定してください:
```javascript
await createPost({
  content: "...",
  authorId: auth.currentUser.uid,  // ← 必須
  visibility: "public"
});
```

### Q4: ルールをロールバックしたい

**A**: 以下の手順でロールバック:
```bash
# 前のバージョンに戻す
git checkout HEAD~1 firestore.rules storage.rules

# デプロイ
firebase deploy --only firestore:rules,storage

# 現在に戻す（必要な場合）
git checkout firestore.rules storage.rules
firebase deploy --only firestore:rules,storage
```

---

## 🔄 定期メンテナンス

### 月1回のチェック

```bash
# ルール構文検証
firebase deploy --only firestore:rules,storage --dry-run

# デプロイ履歴確認
firebase deploy:list

# Firestore ストレージ使用量確認
firebase database:get / --project=<project-id>
```

### 年1回のセキュリティレビュー

1. `firestore.rules` の内容確認
2. `storage.rules` の内容確認
3. セキュリティベストプラクティスの確認
4. 新しい機能に対応したルール追加の検討

---

## 📊 ルール統計

### Firestore ルール

| セクション | 行数 | 対応機能 |
|----------|------|--------|
| 認証関数 | 12 | isAuth, isOwner, isAuthor |
| ユーザーデータ | 4 | プロフィール、設定など |
| 認証関連 | 4 | 確認コード |
| 投稿機能 | 73 | 投稿、いいね、コメント、リポスト、ブックマーク |
| フォロー機能 | 10 | フォロー、アンフォロー |
| レシピ共有 | 42 | レシピ、コメント、いいね |
| ランキング | 8 | 読み取り専用 |
| デフォルト | 4 | セキュリティ第一 |
| **合計** | **157** | **全機能対応** |

### Firebase Storage ルール

| セクション | 行数 | 対象 |
|----------|------|------|
| プロフィール画像 | 32 | アバター・カバー |
| 投稿画像 | 13 | 投稿関連画像 |
| レシピ画像 | 13 | レシピ関連画像 |
| デフォルト | 4 | セキュリティ第一 |
| **合計** | **62** | **全ファイル対応** |

---

## 🎯 チェックリスト

デプロイ前に確認:

- [ ] Firebase CLI がインストールされている
- [ ] `firebase login` でログイン済み
- [ ] `.firebaserc` に正しいプロジェクトID
- [ ] `firestore.rules` ファイルが存在
- [ ] `storage.rules` ファイルが存在
- [ ] `--dry-run` で構文エラーなし
- [ ] Git で変更をコミット済み
- [ ] テストデータで動作確認済み

デプロイ後に確認:

- [ ] `firebase deploy --only firestore:rules,storage --dry-run` で "No changes to deploy"
- [ ] Firebase Console で最新ルールが反映されている
- [ ] アプリで投稿作成が正常に動作
- [ ] 他ユーザーデータにアクセスできない
- [ ] 公開投稿が表示される

---

## 💡 ベストプラクティス

### ✅ 推奨

```javascript
// 認証確認を必ずする
allow create: if request.auth != null ...

// ユーザーIDを明示的にチェック
&& request.auth.uid == request.resource.data.userId

// ファイルサイズを制限
&& request.resource.size < 10 * 1024 * 1024

// ファイル形式を制限
&& request.resource.contentType in ['image/jpeg', 'image/png']
```

### ❌ 非推奨

```javascript
// 認証確認なし
allow create: if true

// ユーザーID確認なし
allow delete: if request.auth != null

// サイズ制限なし
allow create: if request.auth != null

// 形式制限なし
allow create: if request.auth != null
```

---

## 📞 トラブルシューティング

### エラー: "rules.firestore: 1:1 expected '}', got 'service'"

**原因**: Firestore ルール構文エラー

**対応**:
```bash
firebase deploy --only firestore:rules --dry-run
```
エラー内容を確認して修正

### エラー: "resource not found"

**原因**: Firestore が初期化されていない

**対応**:
1. Firebase Console で Firestore Database を作成
2. リージョン: `asia-northeast1`（東京）を推奨
3. セキュリティルールを再デプロイ

### エラー: "Cloud Storage bucket not found"

**原因**: Firebase Storage が初期化されていない

**対応**:
1. Firebase Console で Storage を作成
2. リージョン: `asia-northeast1`（東京）を推奨
3. セキュリティルールを再デプロイ

---

## 📚 参考リンク

- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage ルール](https://firebase.google.com/docs/storage/security/start)
- [Firebase CLI リファレンス](https://firebase.google.com/docs/cli)
- [セキュリティベストプラクティス](https://firebase.google.com/docs/rules/best-practices)

---

## 🎉 完了！

これでセキュリティルールのデプロイは完了です。

**次のステップ:**
1. ✅ アプリを起動してテスト
2. ✅ 投稿作成・編集・削除をテスト
3. ✅ 画像アップロードをテスト
4. ✅ 他ユーザーデータアクセス制限をテスト
5. ✅ 本番環境にデプロイ

Happy Secure Development! 🔐

---

**最終更新**: 2025-10-28
**バージョン**: 1.0.0
**作成**: Claude Code
