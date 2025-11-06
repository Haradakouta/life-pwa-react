# GitHub Pages 404エラー解決ガイド

**作成日**: 2025-01-28
**問題**: manifest.webmanifestとicon-192.pngが404エラーになっている

---

## 🔍 問題の確認

ローカルの`dist`フォルダには以下のファイルが存在します：
- ✅ `manifest.webmanifest`
- ✅ `icon-192.png`
- ✅ `icon-512.png`
- ✅ `index.html`

しかし、GitHub Pagesでは404エラーになっています。

---

## 🚀 解決方法

### 方法1: GitHub Actionsで再デプロイ（推奨）

1. **GitHubリポジトリのActionsタブを開く**
   - URL: https://github.com/Haradakouta/life-pwa-react/actions

2. **「Deploy to GitHub Pages」ワークフローを選択**

3. **「Run workflow」ボタンをクリック**
   - 右上の「Run workflow」ボタンをクリック
   - ブランチを`main`に設定
   - 「Run workflow」をクリック

4. **デプロイの完了を待つ**
   - 通常3-5分かかります
   - 緑色のチェックマークが表示されれば成功

5. **ブラウザのキャッシュをクリア**
   - Ctrl+Shift+R（Windows/Linux）
   - Cmd+Shift+R（Mac）
   - またはシークレットモードで確認

### 方法2: ブラウザのキャッシュをクリア

1. **ブラウザのキャッシュをクリア**
   - 開発者ツール（F12）を開く
   - ネットワークタブを開く
   - 「Disable cache」にチェックを入れる
   - ページをリロード（Ctrl+R）

2. **シークレットモードで確認**
   - シークレットモード（Ctrl+Shift+N）で開く
   - URLにアクセス: https://haradakouta.github.io/life-pwa-react/

---

## 📋 確認事項

### デプロイ後の確認

1. **GitHub Actionsのログを確認**
   - Actionsタブ → 最新のワークフロー実行をクリック
   - 「Upload artifact」ステップでファイルが正しくアップロードされているか確認
   - 「Deploy to GitHub Pages」ステップでデプロイが成功しているか確認

2. **GitHub PagesのURLで直接確認**
   - `https://haradakouta.github.io/life-pwa-react/manifest.webmanifest`
   - `https://haradakouta.github.io/life-pwa-react/icon-192.png`
   - これらのURLに直接アクセスして、ファイルが存在するか確認

3. **ブラウザの開発者ツールで確認**
   - ネットワークタブで404エラーが出ているリソースを確認
   - 実際にリクエストされているURLを確認

---

## 🐛 トラブルシューティング

### エラーが続く場合

1. **GitHub Pagesの設定を確認**
   - Settings → Pages → Source: 「GitHub Actions」が選択されているか確認

2. **デプロイのログを確認**
   - Actionsタブで最新のワークフロー実行のログを確認
   - エラーが出ていないか確認

3. **ファイルが正しくビルドされているか確認**
   - ローカルで`npm run build`を実行
   - `dist`フォルダにファイルが存在するか確認

---

## ✅ 期待される結果

デプロイが成功すると、以下のURLでファイルにアクセスできるようになります：
- ✅ `https://haradakouta.github.io/life-pwa-react/manifest.webmanifest`
- ✅ `https://haradakouta.github.io/life-pwa-react/icon-192.png`
- ✅ `https://haradakouta.github.io/life-pwa-react/icon-512.png`

ブラウザのコンソールで404エラーが出なくなります。

---

## 🔄 次のステップ

1. **GitHub Actionsで再デプロイを実行**
2. **デプロイの完了を待つ（3-5分）**
3. **ブラウザのキャッシュをクリア**
4. **404エラーが解消されているか確認**





