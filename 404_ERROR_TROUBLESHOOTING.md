# 404エラー トラブルシューティングガイド

**作成日**: 2025-01-28
**問題**: リソースが404エラーになっている

---

## 🔍 問題の特定

### ステップ1: ブラウザのコンソールで確認

1. **開発者ツールを開く**（F12）
2. **ネットワークタブ**を開く
3. **ページをリロード**（F5）
4. **404エラーが出ているリソースを確認**
   - 赤色で表示されているリソースを確認
   - リソース名とURLを確認

### ステップ2: どのリソースが404になっているか確認

404エラーが出ているリソースを教えてください：
- `manifest.webmanifest`？
- `icon-192.png`？
- JavaScriptファイル（`index-xxx.js`）？
- CSSファイル（`index-xxx.css`）？
- その他のリソース？

---

## 🚀 解決方法

### 方法1: GitHub Pagesの設定確認

1. **GitHubリポジトリのSettingsを開く**
   - URL: https://github.com/Haradakouta/life-pwa-react/settings/pages
   - 「Settings」タブ → 「Pages」をクリック

2. **Sourceを確認**
   - 「Source」セクションを確認
   - **「gh-pages branch」が選択されているか確認**
   - `/ (root)` が選択されているか確認

3. **設定が正しくない場合**
   - 「Source」を「gh-pages branch」に変更
   - 「Branch」を「gh-pages」に設定
   - 「Folder」を「/ (root)」に設定
   - 「Save」をクリック

### 方法2: 再デプロイ

```bash
# 再ビルドとデプロイ
npm run build
npm run deploy
```

### 方法3: gh-pagesブランチの確認

GitHubリポジトリで`gh-pages`ブランチを確認：
- URL: https://github.com/Haradakouta/life-pwa-react/tree/gh-pages
- 以下のファイルが存在するか確認：
  - `index.html`
  - `manifest.webmanifest`
  - `icon-192.png`
  - `assets/index-xxx.js`
  - `assets/index-xxx.css`

---

## 📋 確認事項

### デプロイ後の確認

1. **GitHub PagesのURLで直接確認**
   - `https://haradakouta.github.io/life-pwa-react/manifest.webmanifest`
   - `https://haradakouta.github.io/life-pwa-react/icon-192.png`
   - これらのURLに直接アクセスして、ファイルが存在するか確認

2. **ブラウザのキャッシュをクリア**
   - Ctrl+Shift+R（Windows/Linux）
   - Cmd+Shift+R（Mac）
   - またはシークレットモードで確認

---

## 🐛 よくある問題

### 問題1: gh-pagesブランチにファイルが存在しない

**原因**: デプロイが正しく実行されていない

**解決策**:
```bash
npm run deploy
```

### 問題2: GitHub Pagesの設定が正しくない

**原因**: Sourceが「gh-pages branch」になっていない

**解決策**:
- Settings → Pages → Source: 「gh-pages branch」を選択
- Folder: 「/ (root)」を選択

### 問題3: ブラウザのキャッシュ

**原因**: 古いファイルがキャッシュされている

**解決策**:
- ハードリロード（Ctrl+Shift+R）
- シークレットモードで確認

---

## ✅ 次のステップ

1. **ブラウザのコンソールで404エラーの詳細を確認**
   - どのリソースが404になっているか教えてください

2. **GitHub Pagesの設定を確認**
   - Settings → Pages → Source: 「gh-pages branch」になっているか確認

3. **gh-pagesブランチを確認**
   - GitHubリポジトリで`gh-pages`ブランチを確認
   - ファイルが存在するか確認





