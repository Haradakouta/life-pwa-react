# 引き継ぎドキュメント

**作成日:** 2025-01-XX  
**目的:** 新しい作業者がスムーズに引き継げるように、重要な情報を簡潔にまとめたドキュメント

---

## 🚨 最重要: 作業前に必ず確認

### 絶対に変更してはいけない設定

1. **`vite.config.ts`の`base: '/'`**
   - Firebase Hosting用の設定
   - `/life-pwa-react/`に戻すと動作しなくなります

2. **PWA設定のパス**
   - `index.html`, `public/manifest.webmanifest`, `public/sw.js`
   - すべて`/`から始まるパス（例: `/manifest.webmanifest`）

3. **`firebase.json`の`hosting`設定**
   - SPAのルーティングに必要
   - `"public": "dist"`と`"rewrites"`設定を変更しない

4. **Firebase Authenticationの承認済みドメイン**
   - `healthfinanse.jp`と`www.healthfinanse.jp`が登録されている必要があります
   - 登録されていないと、Googleログインが`auth/unauthorized-domain`エラーになります

---

## 📋 プロジェクト情報

- **リポジトリ:** https://github.com/Haradakouta/life-pwa-react
- **本番URL:** https://healthfinanse.jp
- **Firebase プロジェクトID:** `oshi-para`
- **Firebase リージョン:** `us-central1`（Cloud Functions）
- **カスタムドメイン:** `healthfinanse.jp`（お名前.com）

---

## 🚀 クイックスタート

### 1. 環境セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/Haradakouta/life-pwa-react.git
cd life-pwa-react

# 依存関係のインストール
npm install

# 環境変数の設定（.envファイルを作成）
# .env.exampleを参考に、すべてのVITE_*変数を設定
```

### 2. 開発サーバー起動

```bash
npm run dev
# → http://localhost:5173
```

### 3. ビルド

```bash
npm run build
# → distディレクトリにビルド結果が生成されます
```

### 4. デプロイ

```bash
# Firebase Hostingにデプロイ
firebase deploy --only hosting

# または、すべてをデプロイ
firebase deploy
```

---

## ⚠️ よくあるエラーと対処法

### 1. `auth/unauthorized-domain`エラー

**原因:** Firebase Authenticationの承認済みドメインにカスタムドメインが登録されていない

**対処:**
1. Firebase Console > Authentication > Settings > 承認済みドメイン
2. `healthfinanse.jp`と`www.healthfinanse.jp`を追加
3. 保存

### 2. PWAが動作しない（アプリ化ボタンが表示されない）

**原因:** PWA設定のパスが間違っている

**対処:**
- `index.html`の`<link rel="manifest" href="/manifest.webmanifest" />`を確認
- `public/manifest.webmanifest`の`start_url`が`"/"`になっているか確認
- `vite.config.ts`の`base: '/'`が正しいか確認

### 3. 404エラー

**原因:** Firebase Hostingの設定が間違っている

**対処:**
- `firebase.json`の`hosting.rewrites`を確認
- `dist`ディレクトリが存在し、`index.html`が含まれているか確認

### 4. ビルドエラー

**原因:** 環境変数が不足している

**対処:**
- `.env`ファイルを確認
- すべての`VITE_*`変数が設定されているか確認

---

## 📚 詳細情報

より詳細な情報は、以下のドキュメントを参照してください：

- **`cursor.md`** - 開発用メモ（AIコーディング用、詳細な技術情報）
- **`README.md`** - プロジェクト概要と機能説明
- **`README_EMAIL_SETUP.md`** - メール送信機能のセットアップ手順

---

## ✅ 引き継ぎチェックリスト

新しい作業者が引き継ぐ際に、以下のチェックリストを確認してください：

- [ ] `.env`ファイルが存在し、すべての`VITE_*`変数が設定されている
- [ ] Firebase CLIにログインしている（`firebase login`）
- [ ] 正しいプロジェクトを選択している（`firebase use oshi-para`）
- [ ] `npm install`が完了している
- [ ] `npm run build`が成功する
- [ ] `firebase deploy --only hosting`が成功する
- [ ] `https://healthfinanse.jp`でサイトが表示される
- [ ] Googleログインが動作する（`auth/unauthorized-domain`エラーが出ない）
- [ ] PWAが動作する（ブラウザで「アプリをインストール」ボタンが表示される）

---

**このドキュメントは簡易版です。詳細は`cursor.md`を参照してください。**

