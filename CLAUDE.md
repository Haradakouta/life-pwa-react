# Claude Code 開発メモ - 健康家計アプリ (React版)

**最終更新: 2025-10-11 (UIモダン化完了！)**

## 📋 プロジェクト概要

Vanilla JSで開発した「健康家計アプリ」をReact + TypeScriptに移行したプロジェクト。
食事記録、カロリー管理、家計簿、在庫管理、AIレシピ生成、バーコードスキャンなどの機能を実装。

**リポジトリ:** https://github.com/Haradakouta/life-pwa-react
**GitHub Pages:** https://haradakouta.github.io/life-pwa-react/
**元プロジェクト:** `/mnt/c/Users/231047/life-pwa`

---

## 🚨 現在の最優先課題

### ~~UIのモダン化~~ ✅ **完了！**

すべての絵文字をReact Iconsに置き換え、モダンなUIを実現しました！

### ~~GitHub Pages デプロイ問題~~ ✅ **解決済み！**

**症状（解決済み）:**
- ✅ ダッシュボード、食事記録、在庫管理など正常表示
- ✅ **AIレシピ画面**も正常表示
- ✅ **設定画面**も正常表示
- GitHub Pages: https://haradakouta.github.io/life-pwa-react/

**原因と解決策:**
1. ✅ **設定画面のクラッシュ**: `settings.monthlyBudget`が`undefined`で`.toString()`エラー
   - **修正**: `(settings.monthlyBudget ?? 30000).toString()`でフォールバック追加

2. ✅ **localStorage互換性問題**: 古いデータで`monthlyBudget`プロパティが欠落
   - **修正**: `useSettingsStore`でデフォルト値とマージ: `{ ...defaultSettings, ...getFromStorage(...) }`

3. ✅ **インラインスタイルのCSS変数化**
   - FavoriteRecipes.tsx: テキスト色を`var(--text-secondary)`に変更
   - RecipeScreen.tsx: ローディングテキスト色を`var(--text-secondary)`に変更
   - SettingsScreen.tsx: データ統計テキスト色を`var(--text-secondary)`に変更

4. ✅ **CSS変数の定義**
   - global.cssに`:root`と`body.dark-mode`のCSS変数を追加
   - ダークモード対応完了

---

## ✅ 完了した実装

### 全9画面 実装完了

1. **Dashboard（ホーム）** - `src/components/dashboard/`
2. **食事記録** - `src/components/meals/`
3. **設定** - `src/components/settings/` ✅
4. **在庫管理** - `src/components/stock/`
5. **買い物リスト** - `src/components/shopping/`
6. **AIレシピ** - `src/components/recipe/` ✅
7. **バーコードスキャン** - `src/components/barcode/`
8. **レポート** - `src/components/report/`
9. **PWA対応** - Service Worker + Manifest

### 主要機能

- ✅ Zustand による状態管理（localStorage 永続化）
- ✅ TypeScript 型安全性
- ✅ Recharts グラフ可視化
- ✅ Google Gemini API（AIレシピ生成）
- ✅ ZXing バーコードスキャン
- ✅ PWA対応（オフライン動作）
- ✅ ダークモード
- ✅ データエクスポート（CSV/JSON）
- ✅ レスポンシブデザイン
- ✅ **React Icons による統一されたアイコンシステム**
- ✅ **モダンなUI（カードシャドウ、ホバーエフェクト、トグルスイッチ）**

---

## 🏗️ プロジェクト構成

```
life-pwa-react/
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── manifest.webmanifest    # PWAマニフェスト
│   └── sw.js                    # Service Worker (v2)
│
├── src/
│   ├── api/
│   │   ├── gemini.ts           # Gemini 2.0 Flash API
│   │   └── rakuten.ts          # 4つの商品検索API
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Layout.tsx      # メインレイアウト・画面遷移
│   │   ├── dashboard/          # ホーム画面
│   │   ├── meals/              # 食事記録
│   │   ├── settings/           # 設定 ⚠️
│   │   ├── stock/              # 在庫管理
│   │   ├── shopping/           # 買い物リスト
│   │   ├── recipe/             # AIレシピ ⚠️
│   │   ├── barcode/            # バーコードスキャン
│   │   └── report/             # レポート
│   │
│   ├── store/
│   │   ├── useIntakeStore.ts   # 食事記録
│   │   ├── useExpenseStore.ts  # 支出
│   │   ├── useStockStore.ts    # 在庫
│   │   ├── useShoppingStore.ts # 買い物リスト
│   │   ├── useRecipeStore.ts   # レシピ履歴・お気に入り
│   │   └── useSettingsStore.ts # 設定・ダークモード
│   │
│   ├── types/                   # TypeScript型定義
│   ├── utils/                   # ユーティリティ関数
│   ├── styles/
│   │   └── global.css          # グローバルCSS（元のstyle.cssコピー）
│   ├── App.tsx                 # ルートコンポーネント
│   └── main.tsx                # エントリーポイント
│
├── vite.config.ts              # Vite設定（base: '/life-pwa-react/'）
├── package.json                # deployスクリプト追加済み
├── .env.example                # 環境変数テンプレート
├── PROGRESS.md                 # 開発進捗（100%完了）
└── CLAUDE.md                   # このファイル
```

---

## 🔧 技術スタック

### フロントエンド
- **React 19** + **TypeScript**
- **Vite** - ビルドツール
- **Zustand** - 状態管理
- **Recharts** - グラフ表示
- **@zxing/library** - バーコードスキャン
- **React Icons** - アイコンライブラリ（Material Design、Feather、Bootstrap）

### 外部API
- **Google Gemini API** (Gemini 2.0 Flash)
- **楽天市場商品検索API**
- **楽天商品検索API**
- **JAN Code Lookup API**
- **Open Food Facts API**

### PWA
- **Service Worker** (Network-first戦略)
- **Web App Manifest**

---

## 🚀 開発コマンド

```bash
# ローカル開発サーバー起動
npm run dev
# → http://localhost:5173

# プロダクションビルド
npm run build

# プロダクションプレビュー
npm run preview
# → http://localhost:4173

# GitHub Pages デプロイ
npm run deploy
# → gh-pages ブランチにビルド成果物をプッシュ
```

---

## 📝 APIキー設定

`.env.example` をコピーして `.env` を作成:

```env
VITE_GEMINI_API_KEY=AIzaSyBSqmtDaNAqF09NTYYKQsTKm-3fLl1LMr0
VITE_RAKUTEN_APP_ID=YOUR_RAKUTEN_APP_ID_HERE
VITE_JANCODE_APP_ID=b72c14dc75bcde18fb7d3628bf7e92b7
```

---

## 🐛 既知の問題

### 1. GitHub Pages で AIレシピ・設定画面が真っ白 ⚠️ **最優先**

**症状:**
- ダッシュボード、食事、在庫などは表示される
- AIレシピと設定だけが白い画面

**これまでの修正:**
- ✅ Service Worker パス修正
- ✅ キャッシュバージョンアップ (v1 → v2)
- ✅ RecipeGenerator、RecipeHistory のインラインスタイル修正

**まだ試していないこと:**
- RecipeDisplay.tsx の修正
- FavoriteRecipes.tsx の修正
- SettingsScreen.tsx の詳細確認
- ブラウザコンソールのエラー確認（ユーザーからのフィードバック待ち）

### 2. Recharts の型エラー

**解決済み**: Pie Chart の label プロパティを `any` 型で回避

### 3. バンドルサイズ警告

**症状:**
```
dist/assets/index-XXX.js   977.78 kB │ gzip: 281.71 kB
(!) Some chunks are larger than 500 kB
```

**今後の改善案:**
- コード分割 (React.lazy, dynamic import)
- ライブラリの軽量化（MUIの代わりにHeadless UIなど）

---

## 🎯 次にやるべきこと

### ~~優先度: 最高 🎨~~ ✅ 完了！

1. ~~**UIのモダン化 (React/Material-UIらしいデザインへ)**~~
   - [x] カードコンポーネントにシャドウとアニメーションを追加
   - [x] ボタンにホバーエフェクトとトランジション
   - [x] トランジションアニメーションの追加
   - [x] グラデーションやアクセントカラーの活用
   - [x] アイコンライブラリの導入（React Icons）
   - [x] トグルスイッチの実装

### 優先度: 高

2. **パフォーマンス最適化**
   - [ ] コード分割 (React.lazy)
   - [ ] バンドルサイズ削減（現在996KB、目標500KB以下）
   - [ ] 画像最適化
   - [ ] dynamic import による遅延読み込み

3. **ページ遷移アニメーション**
   - [ ] 画面切り替え時のトランジション
   - [ ] スライドイン/アウトアニメーション

### 優先度: 中

4. **テスト追加**
   - [ ] E2Eテスト (Playwright)
   - [ ] ユニットテスト (Vitest)

5. **アクセシビリティ**
   - [ ] ARIA属性の追加
   - [ ] キーボードナビゲーション対応
   - [ ] スクリーンリーダー対応

6. **機能追加**
   - [ ] 家計簿画面の実装（現在はアラートのみ）
   - [ ] データのインポート機能
   - [ ] グラフの種類を増やす

---

## 🔍 デバッグ方法

### Service Worker のクリア

```javascript
// DevTools Console で実行
await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
location.reload();
```

### localStorage のクリア

```javascript
localStorage.clear();
location.reload();
```

### ビルド成果物の確認

```bash
# distフォルダの内容確認
ls -la dist/
cat dist/index.html

# gh-pagesブランチの確認
git checkout gh-pages
ls -la
git checkout main
```

---

## 📚 参考資料

### 元プロジェクト
- パス: `/mnt/c/Users/231047/life-pwa`
- CLAUDE.md: 元プロジェクトの詳細な開発履歴あり
- 特にインラインスタイルや色の扱いを参考にする

### Vite設定
- base: GitHub Pages のサブディレクトリ配信用
- https://vitejs.dev/guide/static-deploy.html#github-pages

### GitHub Pages
- Settings → Pages → Source: gh-pages ブランチ
- URL: https://haradakouta.github.io/life-pwa-react/

---

## 💡 開発のヒント

### 新しいコンポーネント作成時の注意

1. **インラインスタイルでCSS変数を使う**
   ```tsx
   // ❌ ダメな例
   style={{ background: 'white', color: '#333' }}

   // ✅ 良い例
   style={{ background: 'var(--card)', color: 'var(--text)' }}
   ```

2. **型定義を確認**
   - `src/types/` を必ず確認
   - `import type { ... }` を使う（verbatimModuleSyntax）

3. **Zustand ストアの使い方**
   ```tsx
   import { useIntakeStore } from '../../store';

   const { intakes, addIntake } = useIntakeStore();
   ```

### GitHub Pages デプロイ後の確認

1. 数分待つ（デプロイに時間がかかる）
2. 強制リロード (`Ctrl+Shift+R`)
3. Service Worker削除
4. キャッシュクリア
5. コンソールでエラー確認

---

## 📅 開発履歴

### 2025-10-11 (セッション2) ✅ **UIモダン化完了！**

**実装内容:**

1. **全絵文字をReact Iconsに置き換え**
   - BottomNav（下部ナビ）: FiHome, MdRestaurant, FiCamera, FiBarChart2, FiSettings
   - QuickActions（3x3グリッド）: MdRestaurant, MdCamera, MdAttachMoney, MdInventory, MdRestaurantMenu, MdShoppingCart, MdBarChart, MdSettings, MdHelpOutline
   - 削除ボタン: MdDelete（食事・在庫・買い物リスト）
   - レシピ画面: MdRestaurantMenu, MdAutoAwesome, MdInventory, MdShoppingCart, MdStar, MdStarBorder
   - バーコード画面: MdQrCodeScanner, MdCamera, MdLightbulb, MdSearch, MdCheckCircle
   - 設定画面: MdDarkMode, MdNotifications, MdDescription, MdCode, MdSave

2. **モダンなカードスタイル**
   - border-radius: 12px
   - box-shadow追加（ライト/ダーク対応）
   - hoverで浮き上がるアニメーション（translateY: -2px）
   - CSS変数を使用した統一的なテーマ管理

3. **ボタンの改善**
   - hoverエフェクト（色変化 + shadow強化）
   - activeエフェクト（押し込みアニメーション）
   - cubic-bezier easingでスムーズな動き
   - すべてのボタンにアイコンを追加

4. **設定画面の大幅改善**
   - トグルスイッチを導入（ダークモード・通知設定）
   - アイコン付きの設定項目
   - .toggle-switch, .setting-item などの新クラス追加

5. **ヘッダーのグラデーション化**
   - linear-gradient(135deg, primary → lighter)
   - ダークモードでも深みのあるグラデーション
   - box-shadowで奥行き追加

6. **入力フィールドの改善**
   - focus時にshadow + 浮き上がり効果
   - border: 2px（より明確）
   - CSS変数による統一的なスタイル

7. **モーダルアニメーション強化**
   - fadeInアニメーション追加
   - slideUpアニメーションを改善
   - background transitionを追加

8. **リストアイテムのホバー効果**
   - background-color transition
   - cursor: pointer

**デプロイ:**
```bash
npm run build
npm run deploy
# → Published ✅
```

**結果:**
- ✅ すべての絵文字をReact Iconsに置き換え完了
- ✅ トグルスイッチによる直感的な設定UI
- ✅ 統一されたアイコンシステム
- ✅ モダンで洗練されたUI
- ✅ ダークモード完全対応

### 2025-10-11 (セッション1) ✅ **GitHub Pages白画面問題を完全解決！**

**問題の特定と修正:**

1. **設定画面のクラッシュ修正** (SettingsScreen.tsx:13)
   ```tsx
   // ❌ 修正前: settings.monthlyBudgetがundefinedでエラー
   const [budget, setBudget] = useState(settings.monthlyBudget.toString());

   // ✅ 修正後: フォールバック値を追加
   const [budget, setBudget] = useState((settings.monthlyBudget ?? 30000).toString());
   ```

2. **localStorage互換性問題の解決** (useSettingsStore.ts:23)
   ```tsx
   // ❌ 修正前: 古いデータでプロパティが欠落
   settings: getFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings),

   // ✅ 修正後: デフォルト値とマージ
   settings: { ...defaultSettings, ...getFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings) },
   ```

3. **CSS変数の追加** (global.css)
   - `:root` と `body.dark-mode` にCSS変数を定義
   - `--text-secondary` を追加（ライト: #666、ダーク: #999）

4. **インラインスタイルの修正**
   - FavoriteRecipes.tsx: `color: '#666'` → `'var(--text-secondary)'`
   - RecipeScreen.tsx: ローディング中のテキスト色を修正
   - SettingsScreen.tsx: データ統計のテキスト色を修正

5. **デプロイ成功**
   ```bash
   npm run build
   node node_modules/gh-pages/bin/gh-pages.js -d dist
   # → Published ✅
   ```

**結果:**
- ✅ AIレシピ画面が正常表示
- ✅ 設定画面が正常表示
- ✅ ダークモードも正常動作
- ✅ GitHub Pages で全画面が動作確認完了

### 2025-10-10 (以前のセッション)

- React + TypeScript 移行完了
- 全9画面実装完了
- Zustand 状態管理
- Recharts グラフ実装
- ZXing バーコードスキャン実装
- PWA対応（Service Worker + Manifest）

---

## 🤝 コラボレーション

このプロジェクトは Claude Code で開発されています。

**次回セッション開始時の確認事項:**

1. このファイル (CLAUDE.md) を読む
2. 「🚨 現在の最優先課題」セクションを確認
3. ブラウザコンソールのエラーをユーザーに確認してもらう
4. エラー内容に応じて修正方針を決定

**よく使うコマンド:**
```bash
# ローカル開発
npm run dev

# ビルド
npm run build

# GitHub Pagesデプロイ
npm run deploy

# ブランチ切り替え
git checkout gh-pages  # デプロイされたファイル確認
git checkout main      # 開発用
```

---

**Happy Coding! 🚀**

**~~次回の目標: ReactらしいモダンなUIを実現する！~~** ✅ **達成！**

**次回の目標: パフォーマンス最適化とページ遷移アニメーション！**
