# Phase 2 実装ガイド - 投稿機能（SNS機能）

**作成日: 2025-10-28**
**対象セッション: 次回セッション（セッション11）**

---

## 📋 Phase 1 完了状況

### ✅ 実装済みの機能

1. **Firebase Storage統合**
   - 画像アップロード機能（アバター、カバー、投稿用）
   - 自動リサイズ機能
   - ファイルバリデーション

2. **プロフィール機能**
   - プロフィール編集画面（アイコン、カバー、名前、bio、URL、公開設定）
   - プロフィールデータ構造（Firestore）
   - 自動プロフィール作成（新規登録時）

3. **データ構造**
   ```
   Firestore
   └── users/{userId}
       └── profile/
           └── data/
               ├── uid
               ├── displayName
               ├── username (ユニーク)
               ├── email
               ├── bio
               ├── avatarUrl
               ├── coverUrl
               ├── websiteUrl
               ├── isPublic
               ├── createdAt
               └── stats (postCount, followerCount, etc.)
   ```

### 📂 関連ファイル

**型定義:**
- `src/types/profile.ts` - UserProfile, UserStats

**ユーティリティ:**
- `src/utils/imageUpload.ts` - 画像アップロード関数
- `src/utils/profile.ts` - プロフィール操作関数

**コンポーネント:**
- `src/components/profile/ProfileEditScreen.tsx` - プロフィール編集画面

---

## 🎯 Phase 2: 投稿機能の実装

### 目標

SNSの基本となる投稿機能を実装します：
- テキスト投稿の作成・表示・削除
- 画像投稿（複数枚対応）
- タイムライン表示
- 投稿詳細画面

---

## 📝 実装すべき機能（優先順位順）

### 1. **投稿用の型定義** ⭐ 最優先

**ファイル:** `src/types/post.ts`

```typescript
export interface Post {
  id: string;
  content: string;
  images?: string[]; // 画像URL配列
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  commentCount: number;
  repostCount: number;
  hashtags?: string[];
  visibility: 'public' | 'followers' | 'private';
  createdAt: string;
  updatedAt?: string;
}

export interface PostFormData {
  content: string;
  images: File[];
  visibility: 'public' | 'followers' | 'private';
}
```

---

### 2. **投稿操作ユーティリティ** ⭐ 最優先

**ファイル:** `src/utils/post.ts`

**必要な関数:**
```typescript
// 投稿を作成
createPost(userId: string, data: PostFormData): Promise<string>

// 投稿を取得
getPost(postId: string): Promise<Post | null>

// ユーザーの投稿一覧を取得
getUserPosts(userId: string, limit?: number): Promise<Post[]>

// タイムライン取得（全体公開の投稿）
getTimelinePosts(limit?: number): Promise<Post[]>

// 投稿を削除
deletePost(postId: string, userId: string): Promise<void>

// 投稿を更新
updatePost(postId: string, userId: string, data: Partial<Post>): Promise<void>
```

**Firestoreデータ構造:**
```
Firestore
├── posts (コレクション)
│   └── {postId}
│       ├── content
│       ├── images (配列)
│       ├── authorId
│       ├── authorName
│       ├── authorAvatar
│       ├── likes
│       ├── commentCount
│       ├── repostCount
│       ├── hashtags
│       ├── visibility
│       ├── createdAt
│       └── updatedAt
└── users/{userId}
    └── posts (サブコレクション) ← ユーザーの投稿一覧用
        └── {postId} (参照のみ)
```

---

### 3. **投稿作成画面** 🎨 UI実装

**ファイル:** `src/components/social/PostCreateScreen.tsx`

**必要な要素:**
- テキスト入力エリア（textarea、文字数カウント）
- 画像アップロード（複数枚対応、プレビュー表示）
- 公開範囲選択（全体公開/フォロワーのみ/非公開）
- 投稿ボタン
- キャンセルボタン

**UIイメージ:**
```
┌─────────────────────────────────┐
│ 投稿を作成          [×]キャンセル│
├─────────────────────────────────┤
│ [プロフィール画像] [名前]        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 今何してる？               │ │
│ │ (テキスト入力エリア)        │ │
│ └─────────────────────────────┘ │
│ 0/280                           │
│                                 │
│ [📷 画像を追加]                │
│                                 │
│ 公開範囲: [▼ 全体公開]         │
│                                 │
│          [投稿する]             │
└─────────────────────────────────┘
```

---

### 4. **タイムライン画面** 🎨 UI実装

**ファイル:** `src/components/social/TimelineScreen.tsx`

**必要な要素:**
- 投稿作成ボタン（FABまたはヘッダー）
- 投稿一覧表示（無限スクロール）
- 各投稿カード:
  - プロフィール画像、名前、投稿時間
  - 本文
  - 画像（複数枚の場合はスライダー）
  - いいね数、コメント数、リポスト数
  - アクションボタン（いいね、コメント、リポスト、共有）

**タブ構成:**
- 全体タイムライン
- フォロー中（Phase 4で実装）

**UIイメージ:**
```
┌─────────────────────────────────┐
│ タイムライン     [＋ 投稿作成]  │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ [👤] 山田太郎  @yamada  2時間前│ │
│ │                             │ │
│ │ 今日のランチ美味しかった！  │ │
│ │ #健康 #料理                 │ │
│ │                             │ │
│ │ [画像]                      │ │
│ │                             │ │
│ │ ♡15  💬3  🔁2              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [👤] 佐藤花子  @sato   5時間前│ │
│ │                             │ │
│ │ 新しいレシピ作ってみた🍳    │ │
│ │                             │ │
│ │ ♡8   💬1   🔁0              │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 5. **投稿詳細画面** 🎨 UI実装

**ファイル:** `src/components/social/PostDetailScreen.tsx`

**必要な要素:**
- 投稿の詳細表示
- コメント一覧（Phase 3で実装）
- いいねしたユーザー一覧（Phase 3で実装）
- 削除ボタン（自分の投稿のみ）

---

### 6. **ソーシャル画面のメイン構成** 🎨 UI実装

**ファイル:** `src/components/social/SocialScreen.tsx`

**タブ構成:**
- タイムライン
- レシピ広場（Phase 5）
- ランキング（Phase 7）
- 通知（Phase 6）

**画面遷移:**
```
BottomNav (設定の隣に追加)
    ↓
SocialScreen (タブ切り替え)
    ├─ TimelineScreen
    ├─ [投稿作成ボタン] → PostCreateScreen
    └─ [投稿クリック] → PostDetailScreen
```

---

### 7. **BottomNavにソーシャル追加** 🔧 統合

**ファイル:** `src/components/layout/BottomNav.tsx`

**変更内容:**
```typescript
export type Screen =
  | 'home'
  | 'meals'
  | 'barcode'
  | 'report'
  | 'social'  // ← 追加
  | 'settings'
  // ... 他の画面
```

**アイコン:** `MdPeople` または `MdForum`

---

## 🛠️ 実装手順（推奨）

### ステップ1: データ構造の準備
1. `src/types/post.ts` を作成
2. `src/utils/post.ts` を作成
3. Firestoreセキュリティルールを更新

### ステップ2: 投稿作成機能
4. `PostCreateScreen.tsx` を作成
5. 画像アップロード機能を統合（`imageUpload.ts`の`uploadPostImage`を使用）
6. 投稿作成のテスト

### ステップ3: タイムライン表示
7. `TimelineScreen.tsx` を作成
8. 投稿一覧の取得・表示
9. 投稿カードコンポーネント（`PostCard.tsx`）を作成

### ステップ4: 投稿詳細
10. `PostDetailScreen.tsx` を作成
11. 削除機能の実装

### ステップ5: 統合
12. `SocialScreen.tsx` を作成（タブ構成）
13. BottomNavに「ソーシャル」を追加
14. Layout.tsxに統合

### ステップ6: テスト・デプロイ
15. ビルド・エラー確認
16. コミット・プッシュ
17. デプロイ

---

## 🔒 Firestoreセキュリティルール

**`firestore.rules` に追加:**

```javascript
// 投稿（posts）のルール
match /posts/{postId} {
  // 読み取り: 公開投稿は誰でも、それ以外は認証済みユーザー
  allow read: if resource.data.visibility == 'public'
              || (request.auth != null && resource.data.visibility == 'followers')
              || (request.auth != null && request.auth.uid == resource.data.authorId);

  // 作成: 認証済みユーザー、かつ自分のuidをauthorIdに設定
  allow create: if request.auth != null
                && request.resource.data.authorId == request.auth.uid;

  // 更新・削除: 自分の投稿のみ
  allow update, delete: if request.auth != null
                        && resource.data.authorId == request.auth.uid;
}
```

---

## 💡 実装のヒント

### 1. **画像アップロードの再利用**

既存の`uploadPostImage`関数を使う:
```typescript
import { uploadPostImage } from '../../utils/imageUpload';

const uploadImages = async (files: File[]) => {
  const uploadPromises = files.map(file => uploadPostImage(user.uid, file));
  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
};
```

### 2. **タイムスタンプの扱い**

Firestoreのタイムスタンプを使う:
```typescript
import { serverTimestamp } from 'firebase/firestore';

await setDoc(postRef, {
  ...postData,
  createdAt: serverTimestamp(),
});
```

### 3. **無限スクロール**

後のフェーズで実装。Phase 2ではシンプルに最新20件を表示。

### 4. **ハッシュタグの抽出**

```typescript
const extractHashtags = (content: string): string[] => {
  const regex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g;
  const matches = content.match(regex);
  return matches ? matches.map(tag => tag.slice(1)) : [];
};
```

### 5. **相対時間表示**

```typescript
const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}時間前`;
  return `${Math.floor(diffMins / 1440)}日前`;
};
```

---

## 🎨 UIデザインのガイドライン

### カラー

既存のCSS変数を使用:
- プライマリ: `var(--primary)` (#4caf50)
- テキスト: `var(--text)`
- セカンダリテキスト: `var(--text-secondary)`
- カード背景: `var(--card)`
- ボーダー: `var(--border)`

### アイコン

React Iconsを使用:
- いいね: `MdFavorite` / `MdFavoriteBorder`
- コメント: `MdComment`
- リポスト: `MdRepeat`
- 共有: `MdShare`
- 削除: `MdDelete`
- 編集: `MdEdit`

### レスポンシブ

```css
@media (max-width: 480px) {
  /* スマホ用スタイル */
}
```

---

## ⚠️ 注意点

### 1. **プロフィール情報の同期**

投稿作成時にプロフィール情報（名前、アバター）をコピーする理由:
- プロフィール変更後も過去の投稿は元の名前・アバターで表示
- パフォーマンス向上（毎回プロフィールを取得しなくて済む）

### 2. **画像のサイズ制限**

投稿画像は1080x1080にリサイズされる（`imageUpload.ts`で実装済み）

### 3. **文字数制限**

投稿本文は280文字程度を推奨（Twitterライク）

### 4. **バッチサイズ警告**

バンドルサイズが大きい（1,657KB）ので、今後コード分割が必要になる可能性あり。

---

## 📚 参考資料

### 既存の類似実装

- レシピ作成: `src/components/recipe/RecipeGenerator.tsx`
- 画像アップロード: `src/utils/imageUpload.ts`
- Firestore操作: `src/utils/firestore.ts`
- プロフィール操作: `src/utils/profile.ts`

### Firebase公式ドキュメント

- Firestore: https://firebase.google.com/docs/firestore
- Storage: https://firebase.google.com/docs/storage

---

## 🚀 Phase 3以降の予定

Phase 2完了後に実装する機能:

**Phase 3: インタラクション**
- いいね機能
- コメント機能
- ブックマーク機能

**Phase 4: フォロー機能**
- フォロー/アンフォロー
- フォロワー管理
- ホームタイムライン（フォロー中の投稿）

**Phase 5: レシピ共有**
- レシピ公開機能
- レシピ広場

---

## ✅ チェックリスト

Phase 2実装時に確認すべき項目:

- [ ] `src/types/post.ts` 作成
- [ ] `src/utils/post.ts` 作成
- [ ] Firestoreセキュリティルール更新
- [ ] `PostCreateScreen.tsx` 作成
- [ ] `TimelineScreen.tsx` 作成
- [ ] `PostCard.tsx` 作成（投稿カード）
- [ ] `PostDetailScreen.tsx` 作成
- [ ] `SocialScreen.tsx` 作成（タブ構成）
- [ ] BottomNavに「ソーシャル」追加
- [ ] Layout.tsxに統合
- [ ] ビルド・エラー確認
- [ ] 動作テスト（投稿作成、表示、削除）
- [ ] コミット・プッシュ・デプロイ

---

**次回セッションでスムーズに開始するために、このファイルを最初に確認してください！**

**Happy Coding! 🚀**
