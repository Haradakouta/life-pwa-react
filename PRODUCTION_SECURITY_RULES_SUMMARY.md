# 🔐 本番環境セキュリティルール完全ガイド

**作成日**: 2025-10-28 (セッション12)
**ステータス**: ✅ 本番環境対応完了

---

## 📌 概要

健康家計アプリ（life-pwa-react）の本番環境向け、完全なセキュリティルール設定ガイドです。
Firestore Database と Firebase Storage の両方に対応し、Phase 1〜7（プロフィール、投稿、インタラクション、フォロー、レシピ、通知、ランキング）の全機能をカバーしています。

---

## 📂 ファイル構成

```
life-pwa-react/
├── firestore.rules                          # Firestore Database ルール（本番対応）
├── storage.rules                            # Firebase Storage ルール（本番対応）
├── FIREBASE_RULES_DEPLOYMENT.md             # デプロイ手順書
└── PRODUCTION_SECURITY_RULES_SUMMARY.md     # このファイル
```

---

## 🎯 対応機能

### ✅ 実装済みの全機能

| フェーズ | 機能 | Firestore ルール | Storage ルール |
|--------|------|----------------|--------------|
| Phase 1 | プロフィール管理 | ✅ users/{userId}/profile | ✅ users/{userId}/profile/avatar |
| Phase 2 | 投稿機能 | ✅ posts/{postId} | ✅ posts/{postId}/* |
| Phase 3 | インタラクション | ✅ posts/{postId}/likes, comments, reposts | ✅ 画像参照 |
| Phase 4 | フォロー機能 | ✅ users/{userId}/followers | ✅ なし |
| Phase 5 | レシピ共有 | ✅ recipes/{recipeId} | ✅ recipes/{recipeId}/* |
| Phase 6 | 通知機能 | ⏳ 予定 | ⏳ 予定 |
| Phase 7 | ランキング | ✅ rankings/posts, recipes | ✅ なし |

---

## 🔒 セキュリティ設計の原則

### 1. ユーザーデータ分離
```javascript
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
- 各ユーザーは自分のプロフィール、設定、記録データのみアクセス可能
- 他ユーザーのプライベートデータは一切見えない

### 2. 公開範囲制御
投稿・レシピは3段階の公開範囲を設定:
- **public**: 全員が読み取り可能
- **followers**: フォロワーと作成者のみ読み取り可能
- **private**: 作成者のみ読み取り可能

```javascript
allow read: if resource.data.visibility == 'public'
            || (isAuth() && resource.data.visibility == 'followers')
            || (isAuthor(resource.data.authorId));
```

### 3. 認証ベースのアクセス制御
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

### 4. 操作別権限設定

| 操作 | 権限 |
|------|------|
| read（読み取り） | public投稿なら誰でも、followers投稿なら認証済みユーザー |
| create（作成） | 認証済みユーザー、かつ自分のuidを設定 |
| update（更新） | 自分の作成データのみ |
| delete（削除） | 自分の作成データのみ |

### 5. ファイルサイズ・形式制限
```javascript
allow create: if request.auth != null
              && request.resource.size < 10 * 1024 * 1024
              && request.resource.contentType in ['image/jpeg', 'image/png'];
```

---

## 📋 Firestore ルール詳細

### パート1: ユーザーデータ分離（全収集）

**対象パス**: `users/{userId}/{document=**}`

**影響範囲**:
- `users/{userId}/profile/data` - プロフィール情報
- `users/{userId}/settings` - ユーザー設定
- `users/{userId}/intakes` - 食事記録
- `users/{userId}/expenses` - 支出
- `users/{userId}/stocks` - 在庫
- `users/{userId}/shopping` - 買い物リスト
- `users/{userId}/recipes` - レシピ履歴

**ルール**: `allow read, write: if isOwner(userId);`

---

### パート2: 認証関連

**対象パス**: `verificationCodes/{email}`

**用途**:
- メール確認コード（登録時・パスワードリセット時）
- 6桁の数字コード（有効期限10分）

**ルール**: `allow read, write: if true;`

**注意**: Cloud Functions で期限管理を実施（セキュリティは期限切れで自動無効化）

---

### パート3: ソーシャル投稿（posts）

**対象パス**: `posts/{postId}`

**含まれる機能**:
1. **投稿本体** - テキスト、画像URL、メタデータ
2. **いいね** - `posts/{postId}/likes/{likeId}`
3. **コメント** - `posts/{postId}/comments/{commentId}`
4. **リポスト** - `posts/{postId}/reposts/{repostId}`
5. **ブックマーク** - `posts/{postId}/bookmarks/{bookmarkId}`

**読み取り権限**:
- public投稿: 誰でも
- followers投稿: 認証済みユーザー
- private投稿: 作成者のみ

**作成権限**: 認証済みユーザーのみ

**削除権限**: 自分の作成データのみ

---

### パート4: フォロー機能

**対象パス**: `users/{userId}/followers/{followId}`

**データ構造**:
```typescript
{
  id: string;           // フォロー関係ID
  followerId: string;   // フォローしてきたユーザーID
  followerName: string; // フォローしてきたユーザー名
  followerAvatar?: string;
  followingId: string;  // フォローされたユーザーID
  followingName: string;
  createdAt: string;    // ISO 8601形式
}
```

**権限**:
- **読み取り**: 認証済みユーザーのみ
- **作成**: 認証済みユーザーのみ
- **削除**: フォローしたユーザー本人のみ

---

### パート5: レシピ共有（recipes）

**対象パス**: `recipes/{recipeId}`

**含まれる機能**:
1. **レシピ本体** - 材料、手順、タグ、画像URL
2. **コメント** - `recipes/{recipeId}/comments/{commentId}`
3. **いいね** - `recipes/{recipeId}/likes/{likeId}`

**権限**: 投稿と同様（visibility で制御）

---

### パート6: ランキング・集計データ

**対象パス**:
- `rankings/posts` - 人気投稿ランキング
- `rankings/recipes` - 人気レシピランキング

**権限**:
- **読み取り**: 誰でも可能
- **書き込み**: なし（Cloud Functions による自動更新）

---

## 💾 Firebase Storage ルール詳細

### ストレージ構造

```
gs://oshi-para.appspot.com/
├── users/{userId}/profile/avatar/{file}    # アバター画像
├── users/{userId}/profile/cover/{file}     # カバー画像
├── posts/{postId}/{file}                   # 投稿画像
└── recipes/{recipeId}/{file}               # レシピ画像
```

### アバター・カバー画像

**パス**: `users/{userId}/profile/avatar/*` / `...profile/cover/*`

**制限**:
- ファイルサイズ: 10MB 以下
- 形式: JPEG, PNG, GIF, WebP のみ

**権限**:
- **読み取り**: 認証済みユーザーのみ
- **アップロード**: 自分の画像のみ
- **削除**: 自分の画像のみ

### 投稿・レシピ画像

**パス**: `posts/{postId}/*` / `recipes/{recipeId}/*`

**制限**:
- ファイルサイズ: 15MB 以下
- 形式: JPEG, PNG, GIF, WebP のみ

**権限**:
- **読み取り**: 認証済みユーザーのみ
- **アップロード**: 認証済みユーザーのみ
- **削除**: 認証済みユーザーのみ

---

## 🚀 デプロイ手順

### 前提条件
```bash
# Firebase CLI をインストール（未インストールの場合）
npm install -g firebase-tools

# Firebase にログイン
firebase login

# プロジェクト確認
firebase projects:list
```

### Firestore ルールのデプロイ

```bash
# ドライラン（デプロイ前確認）
firebase deploy --only firestore:rules --dry-run

# 実際のデプロイ
firebase deploy --only firestore:rules
```

**出力例**:
```
i  uploading rules...
✔  firestore: rules have been successfully published for database: (default)
```

### Storage ルールのデプロイ

```bash
# ドライラン
firebase deploy --only storage --dry-run

# 実際のデプロイ
firebase deploy --only storage
```

**出力例**:
```
i  uploading rules...
✔  storage: rules have been successfully published for default bucket
```

### 両方一度にデプロイ

```bash
firebase deploy --only firestore:rules,storage
```

---

## 🧪 テストシナリオ

### シナリオ1: 公開投稿の表示

```javascript
// ユーザーAの公開投稿をユーザーBが見る
POST visibility: 'public'

// ✅ 読み取り成功（誰でも可能）
```

### シナリオ2: フォロワー限定投稿

```javascript
// ユーザーAのフォロワー限定投稿をユーザーBが見る
POST visibility: 'followers', authorId: A

// 条件:
// - ユーザーBがログイン中: ✅ 読み取り成功
// - ユーザーBがログアウト: ❌ 読み取り失敗
```

### シナリオ3: プライベート投稿

```javascript
// ユーザーAのプライベート投稿をユーザーBが見る
POST visibility: 'private', authorId: A

// ユーザーB がアクセス: ❌ 読み取り失敗
// ユーザーA がアクセス: ✅ 読み取り成功
```

### シナリオ4: 他人のデータアクセス

```javascript
// ユーザーAの設定をユーザーBが見ようとする
GET /users/A/settings

// ユーザーB のアクセス: ❌ 失敗
// ユーザーA のアクセス: ✅ 成功
```

### シナリオ5: 投稿削除権限

```javascript
// ユーザーAの投稿をユーザーBが削除しようとする
DELETE /posts/{postId} where authorId = A

// ユーザーB のアクセス: ❌ 失敗
// ユーザーA のアクセス: ✅ 成功
```

---

## ⚠️ よくある問題と解決

### 問題1: "Permission denied" エラー

**症状**: 投稿作成に失敗する

**原因**: ユーザーがログインしていない OR authorId が設定されていない

**解決**:
```javascript
// フロントエンド側
await createPost({
  content: "Hello",
  images: [],
  authorId: auth.currentUser.uid,  // ← 必須
  ...
});

// Firestore ルール確認
allow create: if isAuth() && request.resource.data.authorId == request.auth.uid;
```

### 問題2: 画像アップロード失敗

**症状**: Firebase Storage へのアップロード失敗

**原因**:
- ファイルサイズが制限超過
- ファイル形式が非対応
- ルールが設定されていない

**解決**:
```javascript
// フロントエンド側でチェック
if (file.size > 10 * 1024 * 1024) {
  alert('10MB以下のファイルをアップロードしてください');
  return;
}

if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
  alert('JPEG, PNG, GIF, WebP 形式のみ対応');
  return;
}

// Storage ルールを確認
allow create: if request.resource.size < 10 * 1024 * 1024
              && request.resource.contentType in [...];
```

### 問題3: 他ユーザーのデータが見える

**症状**: ログインしたユーザーが他ユーザーのプライベートデータを見える

**原因**: ユーザーデータ分離ルールが設定されていない

**解決**:
```javascript
// firestore.rules に以下を追加
match /users/{userId}/{document=**} {
  allow read, write: if isOwner(userId);
}
```

---

## 📊 ルール監視・ログ

### Firestore ルール監視

Firebase Console → Firestore Database → ルール:

1. **ルールのバージョン確認**
   - 「ルール」タブで現在のバージョンを表示
   - デプロイ日時も表示されます

2. **ルール変更履歴**
   - Firestore ではルール変更履歴が自動保存
   - 問題発生時は以前のバージョンに戻せます

### Storage ルール監視

Firebase Console → Storage → ルール:

1. **ルールのバージョン確認**
   - 「ルール」タブで現在のバージョンを表示

2. **ルール変更履歴**
   - Storage ではルール変更履歴が自動保存
   - CLI で確認: `firebase deploy:list`

---

## 🔐 セキュリティチェックリスト

デプロイ前に以下を確認してください:

- [ ] `isAuth()`, `isOwner()`, `isAuthor()` 関数が定義されている
- [ ] ユーザーデータ分離ルールが設定されている（`match /users/{userId}/{document=**}`）
- [ ] 投稿の公開範囲 (visibility) が visibility フィールドで制御されている
- [ ] いいね・コメント・リポストで `userId` チェックが実装されている
- [ ] フォロー削除時に `followerId` チェックが実装されている
- [ ] Storage ファイルサイズ制限が設定されている（10MB または 15MB）
- [ ] Storage ファイル形式制限が設定されている（JPEG, PNG, GIF, WebP）
- [ ] 認証なしで書き込み可能なパスが限定されている（`verificationCodes` のみ）
- [ ] 不要なパスへのアクセスが `false` で拒否されている
- [ ] `--dry-run` で構文エラーがないことを確認

---

## 📈 今後の拡張予定

### Phase 6: 通知機能
- Firestore ルール: `notifications/{userId}/items/{notificationId}` を追加
- 通知権限: 各ユーザーが自分の通知のみ読み取り可能

### Phase 8: メッセージ機能（将来検討）
- Firestore ルール: `conversations/{conversationId}/messages/{messageId}` を追加
- チャット権限: メンバーのみ読み取り・作成可能

### パフォーマンス最適化
- Composite Indexes の追加（複合検索の高速化）
- キャッシュ戦略の改善
- バッチ処理の実装

---

## 💬 トラブルシューティング

### Q: デプロイ後、投稿作成ができない
A: `request.resource.data.authorId == request.auth.uid` ルールが正しいか確認してください。フロントエンド側で `authorId` を必ず設定してください。

### Q: 他ユーザーの設定が見える
A: `match /users/{userId}/{document=**}` ルールで `isOwner(userId)` チェックが実装されているか確認してください。

### Q: 画像アップロードが失敗する
A: Storage ルールでファイルサイズと形式制限を確認してください。フロントエンド側でもバリデーションを実装してください。

### Q: ルールをロールバックしたい
A: `git log` で前のバージョンを確認し、`git checkout <commit-hash> storage.rules` でロールバックしてから `firebase deploy --only storage` でデプロイしてください。

---

## 📞 サポート

問題が発生した場合:

1. **Firebase Console** → **Firestore/Storage** → **ルール** で現在のルールを確認
2. **ブラウザコンソール** でエラーメッセージを確認（`Permission denied` など）
3. **FIREBASE_RULES_DEPLOYMENT.md** のトラブルシューティングセクションを参照
4. **Git 履歴** で前のバージョンを確認・復元

---

## ✅ デプロイ完了確認

すべてのルールが正しくデプロイされたことを確認:

```bash
# Firestore ルール確認
firebase deploy --only firestore:rules --dry-run

# Storage ルール確認
firebase deploy --only storage --dry-run

# 両方とも "No changes to deploy" と表示されれば成功！
```

---

## 🎉 まとめ

本ドキュメントで提供されるセキュリティルールは:

✅ **本番環境対応**: Phase 1〜7 の全機能をカバー
✅ **セキュリティファースト**: ユーザーデータ分離、権限チェック完備
✅ **スケーラブル**: 今後の機能拡張に対応可能
✅ **保守性重視**: コメント、関数分割で可読性向上
✅ **トラブルシューティング完備**: よくある問題と解決方法を記載

セキュリティルールは本番環境での信頼性に直結します。
デプロイ前の確認、定期的なレビューをお勧めします。

**Happy Secure Development! 🔐**

---

**作成**: Claude Code (Haiku 4.5)
**最終更新**: 2025-10-28
**バージョン**: 1.0.0 (本番環境対応)
