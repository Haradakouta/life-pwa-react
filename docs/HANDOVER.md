# 引き継ぎ（別PCセットアップ）ガイド

このドキュメントは、別PCで **同じリポジトリをクローンして即開発・デプロイできる状態** にするためのチェックリストです（フロント/バック両方）。

## 0. 事前に確保するもの（重要）

- GitHub 等のリポジトリURL（または `.git` を含むプロジェクト一式）
- Firebase プロジェクトへの権限（`oshi-para`）
- 手元に保存すべき値（例）
  - フロント: `VITE_*` 環境変数（`.env.local` 推奨）
  - CI: GitHub Actions Secrets（`FIREBASE_TOKEN` など）
  - Functions: Firebase Secrets（`GMAIL_*`, `STRIPE_SECRET_KEY` など）

## 1. 前提（別PCにインストール）

- Node.js: `20`（リポジトリ直下の `.nvmrc` / `.node-version` を参照）
- npm（Node 同梱）
- Firebase CLI（必要なら）: `npm i -g firebase-tools`

## 2. リポジトリ取得 & 依存関係インストール

```bash
git clone <REPO_URL>
cd life-pwa-react

npm ci
```

Functions も触る場合:

```bash
npm ci --prefix functions
```

※ `node_modules/` は引き継ぎ対象にしない（別PCで `npm ci` で再生成）。

## 3. フロント（Vite）環境変数の設定

`life-pwa-react/.env.example` を元に `life-pwa-react/.env.local` を作ります。

```bash
cp .env.example .env.local
```

最低限（アプリが動くために必須）
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

任意（機能に応じて）
- Push通知: `VITE_FCM_VAPID_KEY`
  - Firebase Console → プロジェクト設定 → Cloud Messaging → Web Push 証明書
- 楽天商品検索: `VITE_RAKUTEN_APP_ID`
- JAN Code Lookup: `VITE_JANCODE_APP_ID`
- Gemini: `VITE_GEMINI_API_KEY`（AI関連の一部で参照）
- Stripe: `VITE_STRIPE_PUBLISHABLE_KEY`
- EmailJS: `VITE_EMAILJS_*`

設定後、環境チェック:

```bash
npm run doctor
```

## 4. ローカル起動（フロント）

```bash
npm run dev
```

## 5. Firebase（バックエンド/デプロイ）基本セットアップ

```bash
firebase login
firebase use oshi-para
```

Hosting デプロイ（ローカルから）:

```bash
firebase deploy --only hosting
```

Functions デプロイ（ローカルから）:

```bash
firebase deploy --only functions
```

## 6. Cloud Functions（Secrets / 外部連携）

本番の Functions v2 は Secret Manager（Firebase Secrets）で値を持ちます。

設定例:

```bash
firebase functions:secrets:set GMAIL_EMAIL
firebase functions:secrets:set GMAIL_APP_PASSWORD
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set CLOVA_API_URL
firebase functions:secrets:set CLOVA_SECRET_KEY
```

確認:

```bash
firebase functions:secrets:list
```

メール送信の詳細は `README_EMAIL_SETUP.md` を参照。

## 7. GitHub Actions（自動デプロイ）を使う場合

`.github/workflows/firebase-deploy.yml` が Hosting デプロイを想定しています。

GitHub の Secrets に最低限セット（CIビルドで必須）:
- `FIREBASE_TOKEN`（`firebase login:ci` 等で発行）
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

任意（機能に応じて）:
- `VITE_FCM_VAPID_KEY`
- `VITE_RAKUTEN_APP_ID`
- `VITE_JANCODE_APP_ID`
- `VITE_GEMINI_API_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

## 8. 変更してはいけない設定（運用上の事故防止）

- `vite.config.ts` の `base` は `'/'`（Firebase Hosting 前提）
- PWA関連パスは `/` 始まり（`index.html`, `public/manifest.webmanifest`, `public/sw.js`）
- Hosting は `firebase.json` の `rewrites`（SPAルーティング）前提
