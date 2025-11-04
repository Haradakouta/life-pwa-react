# 次のステップ - GitHub Actions自動デプロイ

**状況**: ワークフローファイルの追加が完了しました ✅

---

## 📋 確認・実行チェックリスト

### ✅ ステップ1: ワークフローの確認（完了済み）
- [x] `.github/workflows/deploy.yml` をGitHubに追加

### 🔍 ステップ2: GitHub Pagesの設定確認

1. **GitHubリポジトリのSettingsを開く**
   - リポジトリ: `https://github.com/Haradakouta/life-pwa-react`
   - 「Settings」タブをクリック

2. **Pages設定を確認**
   - 左サイドバーの「Pages」をクリック
   - 「Source」セクションを確認
   - **「GitHub Actions」が選択されているか確認**
   - もし「gh-pages branch」が選択されている場合は、「GitHub Actions」に変更して保存

### 🚀 ステップ3: 初回デプロイの実行

#### 方法A: 手動実行（推奨）
1. GitHubリポジトリの「Actions」タブを開く
2. 左サイドバーで「Deploy to GitHub Pages」ワークフローを選択
3. 右上の「Run workflow」ボタンをクリック
4. ブランチを`main`に設定
5. 「Run workflow」ボタンをクリック

#### 方法B: 自動実行（プッシュでトリガー）
- `main`ブランチに何か変更をプッシュすると自動的にデプロイが実行されます

### ✅ ステップ4: デプロイの確認

1. **Actionsタブで確認**
   - 「Actions」タブを開く
   - 「Deploy to GitHub Pages」ワークフローを選択
   - 実行状況を確認
   - ✅ 緑色のチェックマーク = 成功
   - ❌ 赤色の×マーク = 失敗（ログを確認）

2. **GitHub PagesのURLで確認**
   - URL: `https://haradakouta.github.io/life-pwa-react/`
   - 最新の変更が反映されているか確認
   - 年齢・身長・体重の設定機能が動作するか確認

---

## 🎯 期待される結果

### 成功時
- ✅ ワークフローが正常に実行される
- ✅ ビルドが成功する
- ✅ GitHub Pagesにデプロイされる
- ✅ アプリが正常に動作する

### 確認ポイント
- [ ] 設定画面で年齢・身長・体重を入力できる
- [ ] 健康情報を保存できる
- [ ] AI健康アドバイスでパーソナライズされたアドバイスが表示される
- [ ] その他の主要機能が正常に動作する

---

## 🐛 トラブルシューティング

### エラー1: "Pages build and deployment source" が設定されていない
**症状**: ワークフローが実行されてもデプロイされない

**解決策**:
1. Settings → Pages を開く
2. Source を「GitHub Actions」に変更
3. 保存

### エラー2: ビルドエラー
**症状**: TypeScriptのコンパイルエラーやビルドエラー

**解決策**:
- Actionsタブでログを確認
- エラーメッセージを確認
- 必要に応じてコードを修正

### エラー3: デプロイが完了しない
**症状**: ワークフローが実行中で完了しない

**解決策**:
- 通常3-5分かかります
- 5分以上かかる場合は、ログを確認してください

---

## 📊 今後の運用

### 自動デプロイの流れ
1. `main`ブランチにコードをプッシュ
2. GitHub Actionsが自動的に検知
3. ビルドとデプロイを実行
4. 数分後にGitHub Pagesに反映

### 手動デプロイ
- いつでも「Actions」タブから手動でワークフローを実行可能
- 緊急時や特定のバージョンをデプロイしたい場合に便利

---

## ✅ 次のアクション

1. **GitHub Pagesの設定を確認**（Settings → Pages → Source: GitHub Actions）
2. **ワークフローを手動実行**（Actions → Deploy to GitHub Pages → Run workflow）
3. **デプロイの成功を確認**（緑色のチェックマーク）
4. **アプリの動作確認**（GitHub PagesのURLで確認）

すべて完了したら、自動デプロイが正常に動作するようになります！🎉

