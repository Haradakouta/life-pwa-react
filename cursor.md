# Cursor 開発用メモ - 健康家計アプリ (React版)

**最終更新: 2025-11-06**

このドキュメントは、AIコーディング（Cursor）で作業を引き継ぐ際に必要な情報をまとめたものです。

---

## 📋 プロジェクト概要

Vanilla JSで開発した「健康家計アプリ」をReact + TypeScriptに移行したプロジェクト。
食事記録、カロリー管理、家計簿、在庫管理、AIレシピ生成、バーコードスキャン、SNS機能などの機能を実装。

**リポジトリ:** https://github.com/Haradakouta/life-pwa-react  
**GitHub Pages:** https://haradakouta.github.io/life-pwa-react/  
**Firebase プロジェクトID:** `oshi-para`  
**Firebase リージョン:** `us-central1`（Cloud Functions）

---

## 🗂️ ディレクトリ構造

```
life-pwa-react/
├── public/
│   ├── icon-192.png, icon-512.png
│   ├── manifest.webmanifest      # PWAマニフェスト
│   ├── sw.js                      # Service Worker
│   └── frames/                    # フレーム画像（6種類）
│
├── src/
│   ├── api/                       # 外部API呼び出し
│   │   ├── gemini.ts             # Gemini API（レシピ生成、OCR）
│   │   ├── rakuten.ts            # 楽天API（商品検索）
│   │   └── vision.ts             # 画像認識API
│   │
│   ├── components/               # Reactコンポーネント
│   │   ├── layout/               # レイアウト（Header, BottomNav, Layout）
│   │   ├── auth/                 # 認証（LoginScreen, RegisterFlow, PasswordResetFlow）
│   │   ├── dashboard/           # ダッシュボード（SummaryCard, QuickActions）
│   │   ├── meals/                # 食事記録
│   │   ├── settings/              # 設定（SettingsScreen, PrefectureSettingScreen, TitleScreen）
│   │   ├── stock/                 # 在庫管理
│   │   ├── shopping/              # 買い物リスト
│   │   ├── recipe/                # AIレシピ
│   │   ├── barcode/               # バーコードスキャン（BarcodeScanner, ReceiptScanner, ReceiptResult）
│   │   ├── expense/               # 家計簿（収入・支出管理）
│   │   ├── report/                # レポート（MonthlyReport, CalorieChart, ExpenseChart, ProductRanking）
│   │   ├── badges/                # バッジ（BadgeScreen, BadgeUnlockedModal）
│   │   ├── social/                # SNS機能
│   │   │   ├── SocialScreen.tsx   # SNSメイン画面
│   │   │   ├── TimelineScreen.tsx # タイムライン
│   │   │   ├── PostCard.tsx       # 投稿カード（X風デザイン）
│   │   │   ├── PostDetailScreen.tsx # 投稿詳細
│   │   │   ├── PostCreateScreen.tsx # 投稿作成（全画面風）
│   │   │   ├── UserProfileScreen.tsx # ユーザープロフィール
│   │   │   ├── NotificationScreen.tsx # 通知画面
│   │   │   ├── ChatScreen.tsx    # DM画面
│   │   │   └── ConversationListScreen.tsx # 会話リスト
│   │   ├── mission/               # 日次ミッション（DailyMissionScreen）
│   │   ├── cosmetic/              # コスメティック（CosmeticShopScreen）
│   │   └── common/                # 共通コンポーネント
│   │       ├── AvatarWithFrame.tsx # アバター＋フレーム表示
│   │       ├── DatePickerModal.tsx # 日付選択モーダル（下部表示）
│   │       ├── MonthPickerModal.tsx # 月選択モーダル（下部表示）
│   │       ├── TitleUnlockedModal.tsx # 称号獲得モーダル
│   │       └── BadgeUnlockedModal.tsx # バッジ獲得モーダル
│   │
│   ├── store/                     # Zustandストア
│   │   ├── useIntakeStore.ts      # 食事記録
│   │   ├── useExpenseStore.ts     # 家計簿（収入・支出）
│   │   ├── useStockStore.ts       # 在庫管理
│   │   ├── useShoppingStore.ts    # 買い物リスト
│   │   ├── useRecipeStore.ts      # レシピ履歴・お気に入り
│   │   ├── useSettingsStore.ts    # 設定（ダークモード、月間予算、健康情報）
│   │   └── useBadgeStore.ts       # バッジ・アチーブメント
│   │
│   ├── config/
│   │   └── firebase.ts            # Firebase初期化（リージョン: us-central1）
│   │
│   ├── types/                     # TypeScript型定義
│   │   ├── intake.ts              # 食事記録（source: 'receipt' | 'recipe' | 'manual'）
│   │   ├── expense.ts             # 家計簿（type: 'expense' | 'income'）
│   │   ├── stock.ts               # 在庫（expiryDate: ISO string）
│   │   ├── shopping.ts            # 買い物リスト（price削除済み）
│   │   ├── settings.ts            # 設定（health: age, height, weight, savings）
│   │   ├── post.ts                # 投稿（quotedPostId, replyToPostId, replyToUserId）
│   │   ├── notification.ts        # 通知（type: 'quote' | 'reply'）
│   │   └── cosmetic.ts            # コスメティック（skinConfig.cssClass）
│   │
│   ├── utils/                      # ユーティリティ関数
│   │   ├── auth.ts                # 認証
│   │   ├── emailVerification.ts   # メール確認（Cloud Functions v2, onRequest）
│   │   ├── firestore.ts           # Firestore操作
│   │   ├── profile.ts             # プロフィール管理
│   │   ├── post.ts                # 投稿管理（引用・リプライ通知）
│   │   ├── friend.ts              # フレンド管理
│   │   ├── chat.ts                # DM管理
│   │   ├── notification.ts        # 通知管理
│   │   ├── mission.ts             # 日次ミッション
│   │   ├── cosmetic.ts            # コスメティック
│   │   ├── title.ts               # 称号管理
│   │   ├── badgeDefinitions.ts    # バッジ定義
│   │   └── healthAdvisor.ts       # AI健康アドバイザー
│   │
│   ├── data/                       # データ定義
│   │   ├── cosmetics.ts           # コスメティックアイテム
│   │   ├── missions.ts            # 日次ミッション
│   │   └── titles.ts              # 称号定義
│   │
│   ├── styles/
│   │   └── global.css             # グローバルスタイル（CSS変数、ダークモード、X風スタイル）
│   │
│   ├── App.tsx                     # ルートコンポーネント
│   └── main.tsx                    # エントリーポイント
│
├── functions/                      # Cloud Functions (v2)
│   ├── src/
│   │   └── index.ts               # メール送信Function（onRequest, Express, CORS）
│   ├── package.json               # Node.js 20, express, cors, nodemailer
│   └── tsconfig.json
│
├── vite.config.ts                  # Vite設定（base: '/life-pwa-react/'）
├── firebase.json                   # Firebase設定
├── .firebaserc                     # Firebaseプロジェクト（oshi-para）
├── firestore.rules                 # Firestoreセキュリティルール
├── storage.rules                   # Storageセキュリティルール
└── .github/workflows/
    └── deploy.yml                  # GitHub Actions デプロイワークフロー
```

---

## 🔧 技術スタック

### フロントエンド
- **React 19.1.1** - UIライブラリ
- **TypeScript 5.9.3** - 型安全性
- **Vite 7.1.7** - ビルドツール（base: '/life-pwa-react/'）
- **Zustand 5.0.8** - 状態管理（localStorage + Firestore永続化）
- **Recharts 3.2.1** - データ可視化
- **React Icons 5.5.0** - アイコンライブラリ（Material Design Icons）

### バックエンド
- **Firebase 12.4.0** - 認証・データベース・ストレージ
  - **プロジェクトID:** `oshi-para`
  - **リージョン:** `us-central1`（Cloud Functions）
  - **プラン:** Blaze（従量課金制）
- **Cloud Functions v2** - Node.js 20, Express, CORS, Nodemailer
- **Secret Manager** - 環境変数管理（GMAIL_EMAIL, GMAIL_APP_PASSWORD）

### 外部API
- **Google Gemini API**
  - `gemini-2.0-flash-exp` - レシピ生成・健康アドバイザー
  - `gemini-2.5-flash-lite` - レシートOCR（1日1,000リクエスト）
- **楽天市場商品検索API** - バーコードスキャン
- **JAN Code Lookup API** - バーコードスキャン
- **Open Food Facts API** - バーコードスキャン

### PWA
- **Service Worker** - オフライン動作（Network-first戦略）
- **Web App Manifest** - ホーム画面追加

---

## 🔑 環境変数

### フロントエンド（`.env`）
```env
# Gemini API
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# 楽天API
VITE_RAKUTEN_APP_ID=YOUR_RAKUTEN_APP_ID_HERE

# JAN Code Lookup API
VITE_JANCODE_APP_ID=YOUR_JANCODE_APP_ID_HERE

# Firebase
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN_HERE
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID_HERE
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET_HERE
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID_HERE
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID_HERE
```

### Cloud Functions（Secret Manager）
```bash
# Gmail認証情報をシークレットとして設定
firebase functions:secrets:set GMAIL_EMAIL
firebase functions:secrets:set GMAIL_APP_PASSWORD

# シークレットの確認
firebase functions:secrets:list
firebase functions:secrets:access GMAIL_EMAIL
```

---

## 🚀 開発ワークフロー

### 1. ローカル開発
```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:5173
```

### 2. ビルド
```bash
# プロダクションビルド
npm run build

# プレビュー
npm run preview
# → http://localhost:4173
```

### 3. デプロイ

#### GitHub Pages（自動デプロイ）
```bash
# mainブランチにpushすると自動デプロイ
git add .
git commit -m "コミットメッセージ"
git push origin main
# → GitHub Actionsが自動でデプロイ
```

#### Cloud Functions
```bash
# Functionsをビルド
cd functions
npm install
npm run build
cd ..

# Functionsをデプロイ
firebase deploy --only functions
```

#### Firestoreルール
```bash
# ルールをデプロイ
firebase deploy --only firestore:rules
```

#### Storageルール
```bash
# ルールをデプロイ
firebase deploy --only storage
```

---

## 📝 重要なファイルと役割

### `src/config/firebase.ts`
- Firebase初期化
- **リージョン指定:** `us-central1`（Cloud Functions）
- エクスポート: `auth`, `db`, `functions`, `storage`

### `src/utils/emailVerification.ts`
- メール確認コード送信
- **Cloud Functions v2:** `onRequest`（Express + CORS）
- **URL:** `https://us-central1-oshi-para.cloudfunctions.net/sendVerificationEmailV2`

### `functions/src/index.ts`
- Cloud Functions定義
- **メール送信:** `sendVerificationEmailV2`（onRequest, Express, CORS）
- **シークレット:** `GMAIL_EMAIL`, `GMAIL_APP_PASSWORD`
- **リージョン:** `us-central1`

### `src/components/layout/Header.tsx`
- アプリヘッダー
- **戻るボタン:** ホーム以外の画面で表示（左側）
- **タイトル:** 中央
- **Adminボタン:** 右側（@haachanのみ）

### `src/components/layout/BottomNav.tsx`
- 下部ナビゲーション
- **画面:** ホーム、食事、スキャン、レポート、ソーシャル、設定

### `src/components/social/PostCard.tsx`
- **X風デザイン:**
  - カード境界線なし、ホバー時に背景色変更
  - アクションボタンは円形、ホバーエフェクト
  - 本文・画像・引用リポストは左側に揃える（marginLeft: '52px'）
  - アクションボタンの最大幅: `425px`

### `src/components/social/TimelineScreen.tsx`
- **X風デザイン:**
  - ヘッダー: 「ホーム」、X風のスタイル
  - タブ: アイコンのみ（MdPublic, MdPeople）
  - 投稿ボタン: X風のスタイル（角丸、太字）

### `src/components/social/PostDetailScreen.tsx`
- **X風デザイン:**
  - スレッド風の表示
  - リプライ表示機能
  - アクションボタンの改善

### `src/components/social/PostCreateScreen.tsx`
- **全画面風モーダル:**
  - モーダルを全画面表示に変更
  - ヘッダー: X風のスタイル
  - 投稿ボタン: 下部に固定

### `src/components/common/AvatarWithFrame.tsx`
- アバター＋フレーム表示コンポーネント
- **フレーム:** 外枠として描画、その中にアイコンを埋め込む
- **サイズ:** `small`（40px）、`medium`（56px）、`large`（80px）

### `src/components/common/DatePickerModal.tsx`
- 日付選択モーダル
- **表示位置:** 画面下部（alignItems: 'flex-end'）

### `src/components/common/MonthPickerModal.tsx`
- 月選択モーダル
- **表示位置:** 画面下部（alignItems: 'flex-end'）

### `src/styles/global.css`
- グローバルスタイル
- **CSS変数:** `--background`, `--text`, `--card`, `--primary`, `--border`
- **ダークモード:** `body.dark-mode`
- **モーダル:** 画面下部に表示（`.modal-content`）
- **X風スタイル:** 投稿カードのホバーエフェクト

### `vite.config.ts`
- Vite設定
- **base:** `/life-pwa-react/`（GitHub Pages用）
- **コード分割:** react-vendor, firebase-vendor, ui-vendor, chart-vendor

### `firestore.rules`
- Firestoreセキュリティルール
- **重要なルール:**
  - `/users/{userId}/profile/data` - プロフィール読み取り（認証済みユーザー）
  - `/users/{userId}/friends/{friendId}` - フレンド管理
  - `/posts/{postId}` - 投稿読み取り（認証済みユーザー）
  - `/posts/{postId}/comments/{commentId}` - コメント管理
  - `/conversations/{conversationId}` - DM管理（参加者のみ）

### `.github/workflows/deploy.yml`
- GitHub Actions デプロイワークフロー
- **トリガー:** mainブランチへのpush
- **環境:** `github-pages`

---

## 🎨 UI/UX設計方針

### X（Twitter）風のSNS機能
- **投稿カード:**
  - カード境界線なし、ホバー時に背景色変更（`var(--background)`）
  - アクションボタンは円形、ホバーエフェクト
  - 本文・画像・引用リポストは左側に揃える（marginLeft: '52px'）
  - アクションボタンの最大幅: `425px`
- **タイムライン:**
  - ヘッダー: 「ホーム」、X風のスタイル
  - タブ: アイコンのみ（MdPublic, MdPeople）
  - 投稿ボタン: X風のスタイル（角丸、太字）
- **投稿詳細:**
  - スレッド風の表示
  - リプライ表示機能
  - アクションボタンの改善
- **投稿作成:**
  - 全画面風モーダル
  - ヘッダー: X風のスタイル
  - 投稿ボタン: 下部に固定

### 健康管理アプリとしてのUI/UX
- **ダッシュボード:**
  - 健康情報表示（BMI計算・カテゴリ表示）
  - サマリーカード（今日のカロリー、今月の支出、BMI）
- **カレンダー:**
  - モーダルは画面下部に表示（alignItems: 'flex-end'）
  - 日付選択、月選択の両方で適用
- **在庫管理:**
  - 賞味期限をカレンダー表示（DatePickerModal）
  - 手打ちで編集可能
- **家計簿:**
  - 収入・支出の両方に対応
  - カテゴリ別集計
  - 予算管理

---

## 🔒 Firebase設定

### Cloud Functions (v2)
- **リージョン:** `us-central1`
- **ランタイム:** Node.js 20
- **シークレット:** `GMAIL_EMAIL`, `GMAIL_APP_PASSWORD`
- **関数:** `sendVerificationEmailV2`（onRequest, Express, CORS）
- **CORS設定:** `https://haradakouta.github.io`, `http://localhost:5173`

### Firestore
- **データ構造:**
  ```
  users/{userId}/
    ├── profile/data (プロフィール)
    ├── intakes (食事記録)
    ├── expenses (家計簿)
    ├── stocks (在庫)
    ├── shopping (買い物リスト)
    ├── recipes (レシピ履歴・お気に入り)
    ├── settings (設定)
    ├── badges (バッジ)
    ├── missions (日次ミッション)
    ├── cosmetics (コスメティック)
    ├── titles (称号)
    ├── friends (フレンド)
    ├── bookmarks (ブックマーク)
    └── notifications (通知)
  
  posts/{postId} (投稿)
    └── comments/{commentId} (コメント)
  
  conversations/{conversationId} (DM)
    └── messages/{messageId} (メッセージ)
  ```

### Storage
- **構造:**
  ```
  avatars/{userId}/avatar.jpg (プロフィール画像)
  posts/{postId}/{imageId}.jpg (投稿画像)
  ```

---

## 📦 データ永続化

### localStorage
- **キー:** `app-intakes`, `app-expenses`, `app-stocks`, `app-shopping`, `app-recipes`, `app-settings`, `app-badges`
- **実装:** `src/utils/localStorage.ts`

### Firestore
- **リアルタイム同期:** `onSnapshot`による自動更新
- **オフライン対応:** 自動キャッシュ
- **ユーザーごとのデータ分離:** `users/{userId}/`パス

---

## 🐛 既知の問題・注意事項

### 1. バンドルサイズ
- **現状:** `dist/assets/index-XXX.js` 約357KB（gzip: 100KB）
- **目標:** 1,000KB以下

### 2. Cloud Functions v2
- **シークレット:** `firebase functions:secrets:set`で設定
- **関数タイプ:** `onRequest`（Express + CORS）を使用
- **リージョン:** `us-central1`を明示的に指定

### 3. GitHub Pages デプロイ
- **base URL:** `/life-pwa-react/`
- **自動デプロイ:** mainブランチへのpushで自動実行
- **環境:** `github-pages`を指定

### 4. モーダル表示
- **カレンダー系モーダル:** 画面下部に表示（`alignItems: 'flex-end'`）
- **実装:** `DatePickerModal.tsx`, `MonthPickerModal.tsx`, `global.css`

### 5. SNS機能
- **X風デザイン:** 投稿カード、タイムライン、投稿詳細、投稿作成
- **通知:** 引用（`quote`）、リプライ（`reply`）の通知を送信
- **リプライ:** リプライへのリプライ、いいね機能を実装

### 6. 健康管理機能
- **BMI表示:** ダッシュボードのサマリーカードに表示
- **賞味期限:** カレンダー表示、手打ちで編集可能
- **家計簿:** 収入・支出の両方に対応

---

## 🔍 重要な型定義

### `Expense`
```typescript
interface Expense {
  id: string;
  type: 'expense' | 'income'; // 支出 or 収入
  category: ExpenseCategory;
  amount: number;
  date: string;
  // ...
}
```

### `Stock`
```typescript
interface Stock {
  id: string;
  name: string;
  expiryDate?: string; // ISO string（カレンダー表示用）
  daysRemaining: number; // 計算値
  // ...
}
```

### `Intake`
```typescript
interface Intake {
  id: string;
  name: string;
  source?: 'receipt' | 'recipe' | 'manual'; // データの出所
  // ...
}
```

### `Settings`
```typescript
interface Settings {
  monthlyBudget: number;
  darkMode: boolean;
  firstTime: boolean;
  age?: number; // 年齢
  height?: number; // 身長（cm）
  weight?: number; // 体重（kg）
  savings?: number; // 貯金額（円）
}
```

### `Post`
```typescript
interface Post {
  id: string;
  content: string;
  authorId: string;
  quotedPostId?: string; // 引用リポスト
  replyToPostId?: string; // リプライ
  replyToUserId?: string; // リプライ先ユーザー
  // ...
}
```

### `Notification`
```typescript
type NotificationType =
  | 'like'
  | 'comment'
  | 'repost'
  | 'quote' // 引用リポスト
  | 'reply' // リプライ
  | 'follow'
  | 'friend_request'
  | 'friend_accept'
  | 'mention';
```

---

## 🎯 開発時の注意事項

### 1. CSS変数の使用
- **インラインスタイル:** CSS変数を使用（`var(--card)`, `var(--text)`など）
- **ダークモード:** `body.dark-mode`クラスで切り替え

### 2. エラーハンドリング
- **catchブロック:** `unknown`型を使用し、`error instanceof Error`で型ガード
- **例:**
  ```typescript
  try {
    // ...
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
  }
  ```

### 3. 型安全性
- **`any`型の使用禁止:** 可能な限り型を指定
- **Optional Chaining:** `?.`を使用して安全にアクセス

### 4. モーダル表示
- **カレンダー系モーダル:** 画面下部に表示（`alignItems: 'flex-end'`）
- **実装:** `DatePickerModal.tsx`, `MonthPickerModal.tsx`, `global.css`

### 5. X風デザイン
- **投稿カード:** ホバー時に背景色変更、アクションボタンは円形
- **タイムライン:** ヘッダーは「ホーム」、タブはアイコンのみ
- **投稿作成:** 全画面風モーダル

### 6. 健康管理機能
- **BMI計算:** `calculateBMI(height, weight)`関数を使用
- **BMIカテゴリ:** `getBMICategory(bmi)`関数を使用
- **賞味期限:** `expiryDate`（ISO string）を使用

---

## 📚 参考資料

### 公式ドキュメント
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [Recharts](https://recharts.org/)
- [Firebase](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev/)

### リポジトリ
- **GitHub:** https://github.com/Haradakouta/life-pwa-react
- **GitHub Pages:** https://haradakouta.github.io/life-pwa-react/

---

## 🔄 バージョン管理

### 重要な変更履歴
- **2025-11-06:** X風UI改善、健康管理機能強化
- **2025-11-05:** SNS機能改善、リファクタリング完了
- **2025-10-30:** SNS関連バグ修正完了

---

## ⚠️ トラブルシューティング

### Service Workerのクリア
```javascript
// DevTools Console
await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
location.reload();
```

### localStorageのクリア
```javascript
localStorage.clear();
location.reload();
```

### Cloud Functionsのデプロイエラー
```bash
# シークレットの確認
firebase functions:secrets:list

# シークレットの再設定
firebase functions:secrets:set GMAIL_EMAIL
firebase functions:secrets:set GMAIL_APP_PASSWORD

# Functionsを再デプロイ
cd functions
npm run build
cd ..
firebase deploy --only functions
```

---

**このドキュメントは定期的に更新されます。**

