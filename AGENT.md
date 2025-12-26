# AGENT 開発ログ - 健康家計アプリ (React版)

**最終更新: 2025-12-15（機能追加凍結・メンテナンスモード移行）**

このドキュメントは、AIエージェント（Antigravity）による開発の全履歴と現状をまとめたものです。
**⚠️ 重要: 新規機能追加は凍結されています。既存機能の保守・修正のみ行ってください。**
**⚠️ 重要: このドキュメントを必ず最初に読んでください。設定を誤るとアプリが動かなくなります。**

---

## 📋 プロジェクト概要

Vanilla JSで開発した「健康家計アプリ」をReact + TypeScriptに移行したプロジェクト。
食事記録、カロリー管理、家計簿、在庫管理、AIレシピ生成、バーコードスキャン、SNS機能などの機能を実装。

**リポジトリ:** https://github.com/Haradakouta/life-pwa-react  
**本番URL:** https://healthfinanse.jp  
**Firebase Hosting:** https://oshi-para.web.app  
**Firebase プロジェクトID:** `oshi-para`  
**Firebase リージョン:** `us-central1`（Cloud Functions）  
**カスタムドメイン:** `healthfinanse.jp`（お名前.com、DNS: dns1.onamae.com, dns2.onamae.com）

---

## ⚠️ 最重要: 作業前に必ず確認すべき設定

### 1. Viteのbase設定（絶対に変更しない）
- **ファイル:** `vite.config.ts`
- **設定値:** `base: '/'`（Firebase Hosting用）
- **⚠️ 警告:** `/life-pwa-react/`に戻すと、Firebase Hostingで動作しなくなります

### 2. PWA設定のパス（絶対に変更しない）
- **ファイル:** `index.html`, `public/manifest.webmanifest`, `public/sw.js`
- **設定値:** すべて`/`から始まるパス（例: `/manifest.webmanifest`）
- **⚠️ 警告:** `/life-pwa-react/`を含むパスに戻すと、PWAが動作しなくなります

### 3. Firebase Authenticationの承認済みドメイン
- **設定場所:** Firebase Console > Authentication > Settings > 承認済みドメイン
- **必須ドメイン:**
  - `healthfinanse.jp`
  - `www.healthfinanse.jp`（必要に応じて）
  - `oshi-para.web.app`
  - `localhost`（開発用）
- **⚠️ 警告:** カスタムドメインを追加しないと、Googleログインが`auth/unauthorized-domain`エラーになります

### 4. Firebase Hosting設定
- **ファイル:** `firebase.json`
- **設定値:** `"public": "dist"`, `"rewrites": [{"source": "**", "destination": "/index.html"}]`
- **⚠️ 警告:** この設定を変更すると、SPAのルーティングが動作しなくなります

### 5. 環境変数（`.env`ファイル）
- **必須変数:** すべての`VITE_*`変数が設定されている必要があります
- **⚠️ 警告:** 環境変数が不足していると、ビルドは成功しても実行時にエラーになります

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
│   │   ├── settings/              # 設定（SettingsScreen, PrefectureSettingScreen, TitleScreen, HealthSettingScreen, WeightInputModal）
│   │   ├── admin/                # 管理者画面（AdminScreen - APIキー設定含む）
│   │   ├── stock/                 # 在庫管理
│   │   ├── shopping/              # 買い物リスト
│   │   ├── recipe/                # AIレシピ
│   │   ├── barcode/               # バーコードスキャン（BarcodeScanner, ReceiptScanner, ReceiptResult）
│   │   ├── expense/               # 家計簿（収入・支出管理）
│   │   ├── report/                # レポート（MonthlyReport, CalorieChart, ExpenseChart, ProductRanking）
│   │   ├── badges/                # バッジ（BadgeScreen, BadgeUnlockedModal）
│   │   ├── goals/                 # 目標管理（GoalsScreen, GoalSettingScreen, GoalProgressCard, GoalsSummary）
│   │   ├── exercise/              # 運動記録（ExerciseScreen, ExerciseForm, ExerciseList）
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
│   │   ├── useGoalStore.ts        # 目標管理（カロリー・予算・体重・運動）
│   │   ├── useExerciseStore.ts    # 運動記録
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
│   │   ├── goal.ts                # 目標（GoalType: calorie, budget, weight, exercise）
│   │   ├── exercise.ts            # 運動記録（name, duration, calories, date）
│   │   ├── post.ts                # 投稿（quotedPostId, replyToPostId, replyToUserId）
│   │   ├── notification.ts        # 通知（type: 'quote' | 'reply'）
│   │   └── cosmetic.ts            # コスメティック（skinConfig.cssClass）
│   │
│   ├── utils/                      # ユーティリティ関数
│   │   ├── auth.ts                # 認証
│   │   ├── emailVerification.ts   # メール確認（Cloud Functions v2, onRequest）
│   │   ├── firestore.ts           # Firestore操作（adminOperations含む）
│   │   ├── profile.ts             # プロフィール管理
│   │   ├── post.ts                # 投稿管理（引用・リプライ通知）
│   │   ├── friend.ts              # フレンド管理
│   │   ├── chat.ts                # DM管理
│   │   ├── notification.ts        # 通知管理
│   │   ├── mission.ts             # 日次ミッション
│   │   ├── cosmetic.ts            # コスメティック
│   │   ├── title.ts               # 称号管理
│   │   ├── badgeDefinitions.ts    # バッジ定義
│   │   ├── healthAdvisor.ts       # AI健康アドバイザー
│   │   ├── healthShopping.ts      # 健康買い物リスト最適化
│   │   ├── weightReminder.ts      # 週次体重入力リマインダー
│   │   ├── gemini403Diagnostics.ts # 403エラー診断ツール（使用停止）
│   │   └── geminiDiagnostics.ts   # Gemini診断ツール（使用停止）
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
├── vite.config.ts                  # Vite設定（base: '/'）
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
- **Vite 7.1.7** - ビルドツール（base: '/'）
- **Zustand 5.0.8** - 状態管理（localStorage + Firestore永続化）
- **Recharts 3.2.1** - データ可視化
- **React Icons 5.5.0** - アイコンライブラリ（Material Design Icons）

### バックエンド
- **Firebase 12.4.0** - 認証・データベース・ストレージ
  - **プロジェクトID:** `oshi-para`
  - **リージョン:** `us-central1`（Cloud Functions）
  - **プラン:** Blaze（従量課金制）
- **Cloud Functions v2** - Node.js 20, Express, CORS, Nodemailer, BigQuery Client
- **BigQuery** - Gemini APIログの蓄積・分析（データセット: `gemini_logs`, テーブル: `interactions`）
- **Secret Manager** - 環境変数管理（GMAIL_EMAIL, GMAIL_APP_PASSWORD）

### 外部API
- **Google Gemini API**
  - **モデル:** `gemini-2.5-flash-lite`（すべての機能で使用）
  - **⚠️ 重要:** `gemini-2.0-flash-exp`は無料プランで利用できないため、使用禁止
  - **無料プラン:** 1日1,000リクエストまで利用可能
  - **APIキー管理:**
    - 運営者APIキー: Firestoreの`admin/config`コレクションに保存（管理者画面から設定可能）
    - ユーザーAPIキー: 各ユーザーの設定（`users/{userId}/settings`）に保存
    - 優先順位: ユーザーAPIキー → 運営者APIキー → 環境変数 → デフォルト値
  - **エラーハンドリング:**
    - 429エラー時に自動リトライ（最大1回、retry-afterヘッダーに基づく待機時間）
    - 403エラー時はユーザーにエラーメッセージを表示
  - **ログ記録:**
    - 全インタラクションをBigQueryに記録（`logGeminiInteraction`）
    - Few-shot Prompting用に過去の成功例を取得（`getFewShotExamples`）
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

#### Firebase Hosting（本番環境）
```bash
# ビルド
npm run build

# Firebase Hostingにデプロイ
firebase deploy --only hosting

# または、すべてをデプロイ
firebase deploy
```

**⚠️ 重要:**
- デプロイ前に必ず`npm run build`を実行してください
- `dist`ディレクトリが正しく生成されているか確認してください
- デプロイ後、`https://healthfinanse.jp`で動作確認してください

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

### `src/api/gemini.ts`
- Gemini API呼び出し
- **使用モデル:** `gemini-2.5-flash-lite`（⚠️ `gemini-2.0-flash-exp`は使用禁止）
- **APIキー取得順序:** ユーザーAPIキー → 運営者APIキー（Firestore） → 環境変数 → デフォルト値
- **429エラー自動リトライ:** `retryOn429`関数（最大1回、retry-afterヘッダーに基づく待機時間）
- **キャッシュ:** 運営者APIキーは5分間キャッシュ（`CACHE_DURATION`）

### `src/utils/firestore.ts`
- Firestore操作
- **`adminOperations`:** 管理者設定の取得・更新
  - `getConfig()`: `admin/config`から設定を取得
  - `updateConfig()`: `admin/config`を更新（認証済みユーザーのみ）

### `functions/src/index.ts`
- Cloud Functions定義
- **メール送信:** `sendVerificationEmailV2`（onRequest, Express, CORS）
- **Geminiログ記録:** `logGeminiInteraction`（onCall） - BigQueryへの非同期ログ記録
- **Few-shot例取得:** `getFewShotExamples`（onCall） - BigQueryから成功例を取得
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
- **base:** `/`（Firebase Hosting用）⚠️ **絶対に変更しない**
- **コード分割:** react-vendor, firebase-vendor, ui-vendor, chart-vendor
- **⚠️ 警告:** baseを`/life-pwa-react/`に戻すと、Firebase Hostingで動作しなくなります

### `firestore.rules`
- Firestoreセキュリティルール
- **重要なルール:**
  - `/users/{userId}/profile/data` - プロフィール読み取り（認証済みユーザー）
  - `/users/{userId}/friends/{friendId}` - フレンド管理
  - `/posts/{postId}` - 投稿読み取り（認証済みユーザー）
  - `/posts/{postId}/comments/{commentId}` - コメント管理
  - `/conversations/{conversationId}` - DM管理（参加者のみ）
  - `/admin/config` - 管理者設定（読み取り: 全ユーザー、書き込み: 認証済みユーザー）

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
- **関数:** 
  - `sendVerificationEmailV2`（onRequest, Express, CORS）
  - `logGeminiInteraction`（onCall）
  - `getFewShotExamples`（onCall）
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
    ├── settings (設定 - geminiApiKey含む)
    ├── goals (目標 - calorie, budget, weight, exercise)
    ├── exercises (運動記録)
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
  
  admin/
    └── config (管理者設定 - geminiApiKey含む)
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
- **キー:** `app-intakes`, `app-expenses`, `app-stocks`, `app-shopping`, `app-recipes`, `app-settings`, `app-badges`, `goals`, `exercises`
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

### 3. Firebase Hosting デプロイ
- **base URL:** `/`（ルートパス）⚠️ **絶対に変更しない**
- **デプロイ方法:** `firebase deploy --only hosting`
- **カスタムドメイン:** `healthfinanse.jp`（お名前.comでDNS設定済み）
- **⚠️ 重要:** 
  - デプロイ前に必ず`npm run build`を実行
  - `dist`ディレクトリが正しく生成されているか確認
  - デプロイ後、カスタムドメインで動作確認

### 4. Firebase Authentication 承認済みドメイン
- **設定場所:** Firebase Console > Authentication > Settings > 承認済みドメイン
- **必須ドメイン:** `healthfinanse.jp`, `www.healthfinanse.jp`, `oshi-para.web.app`, `localhost`
- **⚠️ 警告:** カスタムドメインを追加しないと、Googleログインが`auth/unauthorized-domain`エラーになります

### 6. モーダル表示
- **カレンダー系モーダル:** 画面下部に表示（`alignItems: 'flex-end'`）
- **実装:** `DatePickerModal.tsx`, `MonthPickerModal.tsx`, `global.css`

### 7. SNS機能
- **X風デザイン:** 投稿カード、タイムライン、投稿詳細、投稿作成
- **通知:** 引用（`quote`）、リプライ（`reply`）の通知を送信
- **リプライ:** リプライへのリプライ、いいね機能を実装

### 6. 健康管理機能
- **BMI表示:** ダッシュボードのサマリーカードに表示
- **賞味期限:** カレンダー表示、手打ちで編集可能
- **家計簿:** 収入・支出の両方に対応

### 7. Gemini API設定
- **⚠️ 重要:** `gemini-2.0-flash-exp`は無料プランで利用できないため、使用禁止
- **使用モデル:** `gemini-2.5-flash-lite`のみ（すべての機能で統一）
- **APIキー管理:**
  - 運営者APIキー: Firestoreの`admin/config`コレクション（管理者画面から設定）
  - ユーザーAPIキー: 各ユーザーの設定に保存（設定画面から設定）
  - キャッシュ: 5分間キャッシュ（`CACHE_DURATION`）
- **エラーハンドリング:**
  - 429エラー: 自動リトライ（`retryOn429`関数、最大1回）
  - 403エラー: エラーメッセージを表示
  - ネットワークエラー: エラーメッセージを表示

### 8. Firestore管理者コレクション
- **コレクション:** `admin/config`
- **フィールド:** `geminiApiKey`（string）、`updatedAt`（string）、`updatedBy`（string）
- **セキュリティルール:**
  - 読み取り: 全ユーザー可能（`allow read: if true`）
  - 書き込み: 認証済みユーザーのみ（`allow write: if isAuth()`）
  - **注意:** 実際の管理者チェックはアプリケーション側（`AdminScreen`）で実施
- **アクセス方法:** `src/utils/firestore.ts`の`adminOperations.getConfig()`と`adminOperations.updateConfig()`

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

### `Goal`
```typescript
type GoalType = 'calorie' | 'budget' | 'weight' | 'exercise';
type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';
type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string; // 'kcal', '円', 'kg', '分' など
  period: GoalPeriod;
  startDate: string; // ISO string
  endDate?: string; // ISO string (custom periodの場合)
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  progressHistory?: { date: string; value: number }[]; // 進捗履歴（日次）
}
```

### `Exercise`
```typescript
interface Exercise {
  id: string;
  userId: string;
  name: string; // 運動名（例: ランニング、筋トレ）
  duration: number; // 運動時間（分）
  caloriesBurned: number; // 消費カロリー
  date: string; // ISO date string
  category?: string; // カテゴリ（例: 有酸素運動）
  createdAt: string;
  updatedAt?: string;
}
```

---

## 🌐 多言語対応（i18n）方針

### ⚠️ 重要な開発方針
**新機能の開発時は、日本語のみで実装してください。多言語対応は最終仕上げの段階で一括して行います。**

### 理由
- 開発効率の向上：新機能追加時に毎回8言語すべてに翻訳を追加するのは非効率的
- 機能の安定化を優先：まず機能を完成させ、その後で多言語対応を行う
- 一貫性の確保：最終仕上げで一括翻訳することで、翻訳の一貫性が保たれる

### 対応言語
- 日本語（ja）
- 英語（en）
- 中国語簡体字（zh-CN）
- 中国語繁体字（zh-TW）
- 韓国語（ko）
- ベトナム語（vi）
- ロシア語（ru）
- インドネシア語（id）

### 実装方法
- **ライブラリ:** `i18next` + `react-i18next`
- **設定ファイル:** `src/i18n/config.ts`
- **翻訳ファイル:** `src/i18n/locales/*.json`
- **使用方法:** `const { t } = useTranslation();` → `t('key.path')`

### 多言語対応のタイミング
1. **開発中:** 日本語のみで実装（ハードコードされた日本語文字列でOK）
2. **最終仕上げ:** すべての日本語文字列を`t()`関数に置き換え、8言語すべてに翻訳キーを追加

### 既存の多言語対応済み機能
- 設定画面（言語選択含む）
- ダッシュボード
- 食事記録
- 運動記録
- 目標管理
- 家計簿
- 在庫管理
- 買い物リスト
- 認証画面（ログイン・登録・パスワードリセット）
- 共通コンポーネント（DatePickerModal、MonthPickerModal、Calendar等）

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

### 7. 多言語対応の開発方針
- **新機能開発時:** 日本語のみで実装（ハードコードされた日本語文字列でOK）
- **最終仕上げ時:** すべての日本語文字列を`t()`関数に置き換え、8言語すべてに翻訳キーを追加
- **既存機能:** 多言語対応済みの機能は`useTranslation()`フックを使用

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
- **2025-12-15:** 機能凍結宣言。メンテナンスモードへ移行。
- **2025-12-14:** レイドバトル（PvE）、コスメティック機能実装。バーコード/レシートスキャン刷新（ネイティブカメラ化）。収益化基盤（Stripe）実装。
- **2025-01-XX:** 目標管理機能追加（カロリー・予算・体重・運動の4種類）、運動記録機能追加、ダッシュボードUI改善
- **2025-01-XX:** Firestore管理者APIキー管理機能追加、`gemini-2.5-flash-lite`への統一、429エラー自動リトライ機能追加
- **2025-01-XX:** Firebase Hostingへの移行、カスタムドメイン（healthfinanse.jp）設定、PWA設定修正
- **2025-11-06:** X風UI改善、健康管理機能強化
- **2025-11-05:** SNS機能改善、リファクタリング完了
- **2025-10-30:** SNS関連バグ修正完了

### 重要な移行履歴
- **GitHub Pages → Firebase Hosting:** 2025-01-XXに移行完了
  - `vite.config.ts`の`base`を`/life-pwa-react/`から`/`に変更
  - PWA設定のパスをすべて`/`から始まるパスに変更
  - `firebase.json`に`hosting`設定を追加
- **カスタムドメイン設定:** `healthfinanse.jp`を設定
  - お名前.comでDNS設定（Aレコード、TXTレコード）
  - Firebase Authenticationの承認済みドメインに追加

---

## ⚠️ トラブルシューティング

### 1. PWAが動作しない（アプリ化ボタンが表示されない）
**原因:** PWA設定のパスが間違っている可能性があります

**確認事項:**
- `index.html`の`<link rel="manifest" href="/manifest.webmanifest" />`が正しいか
- `public/manifest.webmanifest`の`start_url`が`"/"`になっているか
- `public/sw.js`のキャッシュパスが`/`から始まっているか
- `vite.config.ts`の`base: '/'`が正しいか

**解決方法:**
```bash
# ビルドして確認
npm run build

# Service Workerをクリア（ブラウザのDevTools Console）
await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
location.reload();
```

### 2. Googleログインが`auth/unauthorized-domain`エラーになる
**原因:** Firebase Authenticationの承認済みドメインにカスタムドメインが登録されていない

**解決方法:**
1. Firebase Console > Authentication > Settings > 承認済みドメイン
2. `healthfinanse.jp`と`www.healthfinanse.jp`を追加
3. 保存

### 3. サイトが表示されない（404エラー）
**原因:** Firebase Hostingの設定が間違っている可能性があります

**確認事項:**
- `firebase.json`の`hosting.public`が`"dist"`になっているか
- `firebase.json`の`hosting.rewrites`が正しく設定されているか
- `dist`ディレクトリが存在し、`index.html`が含まれているか

**解決方法:**
```bash
# ビルド
npm run build

# デプロイ
firebase deploy --only hosting
```

### 4. Service Workerのクリア
```javascript
// DevTools Console
await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
location.reload();
```

### 5. localStorageのクリア
```javascript
localStorage.clear();
location.reload();
```

### 6. Cloud Functionsのデプロイエラー
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

### 7. ビルドエラー
**原因:** 環境変数が不足している可能性があります

**確認事項:**
- `.env`ファイルが存在するか
- すべての`VITE_*`変数が設定されているか

**解決方法:**
```bash
# .envファイルを確認
cat .env

# 不足している変数を追加
# 例: VITE_FIREBASE_API_KEY=...
```

### 8. カスタムドメインが接続されない
**原因:** DNS設定が正しくない可能性があります

**確認事項:**
- お名前.comのDNS設定でAレコードがGoogleのIP（Firebase Consoleで確認）を指しているか
- TXTレコードが正しく設定されているか
- DNSの反映に時間がかかる場合がある（最大24時間）

**解決方法:**
1. Firebase Console > Hosting > カスタムドメインで確認
2. DNS設定を確認（お名前.comのDNS設定画面）
3. 時間を置いて再確認

---

---

## 📝 引き継ぎ時のチェックリスト

新しい作業者が引き継ぐ際に、以下のチェックリストを確認してください：

### ✅ 必須確認事項

1. **環境変数（`.env`ファイル）**
   - [ ] `.env`ファイルが存在するか
   - [ ] すべての`VITE_*`変数が設定されているか
   - [ ] Firebase設定値が正しいか

2. **Firebase設定**
   - [ ] Firebase CLIにログインしているか（`firebase login`）
   - [ ] 正しいプロジェクトを選択しているか（`firebase use oshi-para`）
   - [ ] Cloud Functionsのシークレットが設定されているか（`firebase functions:secrets:list`）

3. **ビルド確認**
   - [ ] `npm install`が完了しているか
   - [ ] `npm run build`が成功するか
   - [ ] `dist`ディレクトリが正しく生成されているか

4. **デプロイ確認**
   - [ ] `firebase deploy --only hosting`が成功するか
   - [ ] `https://healthfinanse.jp`でサイトが表示されるか
   - [ ] Googleログインが動作するか（`auth/unauthorized-domain`エラーが出ないか）

5. **PWA確認**
   - [ ] ブラウザで「アプリをインストール」ボタンが表示されるか
   - [ ] Service Workerが正しく登録されているか（DevTools > Application > Service Workers）

### ⚠️ 絶対に変更してはいけない設定

1. **`vite.config.ts`の`base: '/'`** - Firebase Hosting用の設定
2. **PWA設定のパス** - `index.html`, `public/manifest.webmanifest`, `public/sw.js`のパス
3. **`firebase.json`の`hosting`設定** - SPAのルーティングに必要
4. **Firebase Authenticationの承認済みドメイン** - カスタムドメインが登録されているか
5. **Gemini APIモデル** - `gemini-2.5-flash-lite`のみを使用（`gemini-2.0-flash-exp`は使用禁止）
6. **Firestoreルールの`admin/config`** - 読み取りは全ユーザー可能、書き込みは認証済みユーザーのみ
7. **Service Workerのキャッシュバージョン** - 更新時は必ずバージョン番号を変更（現在: `v3`）

### 🔧 よくあるエラーと対処法

1. **`auth/unauthorized-domain`エラー**
   - 原因: Firebase Authenticationの承認済みドメインにカスタムドメインが登録されていない
   - 対処: Firebase Console > Authentication > Settings > 承認済みドメインに追加

2. **PWAが動作しない**
   - 原因: PWA設定のパスが間違っている
   - 対処: `index.html`, `public/manifest.webmanifest`, `public/sw.js`のパスを確認

3. **404エラー**
   - 原因: Firebase Hostingの設定が間違っている
   - 対処: `firebase.json`の`hosting.rewrites`を確認

4. **ビルドエラー**
   - 原因: 環境変数が不足している
   - 対処: `.env`ファイルを確認し、不足している変数を追加

---

**このドキュメントは定期的に更新されます。作業前に必ず最新版を確認してください。**
