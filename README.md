# 健康家計アプリ (React版) 🥗💰

**AIが健康をサポートする、シームレスな生活管理アプリ**

[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://haradakouta.github.io/life-pwa-react/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)

---

## 🌟 特徴

### 🔗 シームレスな機能連携
- **バーコードスキャン → 在庫管理** - スキャンしたら自動で在庫画面へ
- **買い物リスト → 在庫管理** - チェックした商品を一括で在庫に追加
- **在庫管理 → 買い物リスト** - 各アイテムからワンタップで買い物リストへ
- **期限切れ間近 → 買い物リスト** - 期限切れ間近の商品を一括追加

### 🤖 AI健康アドバイザー
- **自動健康チェック** - 不健康な商品を12カテゴリ・80以上のキーワードで検出
- **代替案の提案** - より健康的な選択肢を3〜4個提案
- **Gemini API統合** - 詳細なパーソナライズ分析（オプション）
- **押し付けない設計** - ユーザーが自分で選択できる

### 📱 モダンなUI/UX
- **X（Twitter）風のSNS機能** - シンプルで直感的なタイムライン
- **React Icons** - 統一されたアイコンシステム
- **カードシャドウ** - 奥行きのあるデザイン
- **ホバーエフェクト** - スムーズなアニメーション
- **ダークモード** - 目に優しい夜間モード
- **レスポンシブ** - スマホ・タブレット対応
- **多言語対応** - 8言語対応（日本語、英語、中国語簡体字・繁体字、韓国語、ベトナム語、ロシア語、インドネシア語）

### 🔧 全17画面の完全機能
1. **ダッシュボード** - 今日のカロリー・今月の支出・BMI表示・目標進捗サマリー
2. **食事記録** - カロリー・支出管理・AIカロリー計測（Gemini API）
3. **在庫管理** - 賞味期限カレンダー表示・期限切れアラート
4. **買い物リスト** - チェック機能付き・健康目標に基づくAI提案
5. **AIレシピ** - Gemini APIでレシピ生成
6. **バーコードスキャン** - ZXingで商品情報取得＋レシートOCR
7. **レポート** - グラフで可視化＋月次レポート＋AI改善提案
8. **バッジ** - アチーブメントシステム（14種類のバッジ）
9. **設定** - トグルスイッチUI＋通知設定＋健康情報設定（身長・体重・年齢）
10. **家計簿** - 収入・支出管理・予算管理・カテゴリ別集計
11. **目標管理** - カロリー・予算・体重・運動の4種類の目標設定と進捗追跡
12. **運動記録** - 運動名・時間・消費カロリーの記録と運動目標への自動反映
13. **PWA対応** - オフライン動作
14. **SNSタイムライン** - X（Twitter）風のソーシャル機能
15. **投稿作成・編集** - 画像投稿、ハッシュタグ、メンション対応
16. **プロフィール** - フォロー/アンフォロー機能、投稿一覧、プロフィール編集
17. **通知・DM** - いいね・コメント・フォロー・引用・リプライ・DM通知（リアルタイム・未読バッジ）

### 🔐 Firebase統合
- **Firebase Authentication** - ユーザー認証（メール/パスワード、Google）
- **Firestore Database** - クラウドデータ保存（ユーザーデータ、投稿、通知）
- **Firebase Storage** - 画像アップロード（プロフィール画像、投稿画像）
- **リアルタイム同期** - 複数デバイス間でデータ同期
- **3ステップ登録** - メール確認コード方式の新規登録フロー（個人情報入力含む）
- **Cloud Functions** - Nodemailer + Gmail SMTPでメール送信（v2, Secret Manager）

### 🎮 継続利用を促進する仕組み
- **🔔 通知機能** - 朝・昼・夕の食事記録リマインダー（Web Notification API）+ SNS通知・DM通知
- **🏆 バッジシステム** - 14種類のアチーブメント（連続記録、マイルストーン、目標達成、機能活用）
- **📊 月次レポート** - サマリー、先月比較、Gemini APIによるAI改善提案
- **📱 SNS機能** - X（Twitter）風のタイムライン、フォロー機能、リアルタイム通知、DM機能
- **🎨 コスメティック** - フレーム、名前色、スキン（称号獲得で解放）
- **💪 健康管理** - 身長・体重・年齢設定、BMI自動計算、週次体重入力リマインダー（毎週月曜日）
- **🎯 目標管理** - カロリー・予算・体重・運動の4種類の目標設定、進捗追跡、達成通知、バッジ獲得
- **🏃 運動記録** - 運動名・時間・消費カロリーの記録、運動目標への自動反映、日次集計
- **🛒 健康買い物リスト** - BMI・健康目標に基づく食材提案、栄養不足補完提案

---

## 🚀 デモ

**GitHub Pages:** https://haradakouta.github.io/life-pwa-react/

---

## 📸 スクリーンショット

### X風のSNS機能
- シンプルで直感的なタイムライン
- ホバーエフェクト付きのアクションボタン
- スレッド風の投稿詳細表示

### 健康管理
- ダッシュボードにBMI表示
- 賞味期限カレンダー表示
- 健康情報の可視化

---

## 🛠️ 技術スタック

### フロントエンド
- **React 19** - 最新のReact
- **TypeScript 5** - 型安全性
- **Vite 7** - 高速ビルドツール
- **Zustand** - 軽量な状態管理
- **Recharts** - データ可視化
- **React Icons** - アイコンライブラリ

### 外部API
- **Google Gemini API** - AIレシピ生成・健康分析・レシートOCR・カロリー計測・買い物リスト最適化
  - `gemini-2.5-flash-lite` - すべてのAI機能で使用（レシピ生成・健康アドバイザー・レシートOCR・カロリー計測・買い物リスト提案）
  - **無料プラン対応** - 1日1,000リクエストまで利用可能
  - **自動リトライ機能** - 429エラー時に自動的に再試行
  - **ユーザーAPIキー設定** - 設定画面で各自のAPIキーを設定可能
- **楽天市場商品検索API** - バーコードスキャン
- **楽天商品検索API** - バーコードスキャン
- **JAN Code Lookup API** - バーコードスキャン
- **Open Food Facts API** - バーコードスキャン

### PWA
- **Service Worker** - オフライン動作
- **Web App Manifest** - ホーム画面追加

### その他
- **@zxing/library** - バーコードスキャン
- **localStorage** - データ永続化

### バックエンド
- **Firebase Authentication** - ユーザー認証
- **Firestore Database** - NoSQLクラウドデータベース
- **Firebase Storage** - 画像アップロード
- **Cloud Functions (v2)** - メール送信（Nodemailer + Gmail SMTP）
- **Secret Manager** - 環境変数管理

---

## 📦 セットアップ

### 1. クローン

```bash
git clone https://github.com/Haradakouta/life-pwa-react.git
cd life-pwa-react
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`を作成：

```bash
cp .env.example .env
```

`.env`を編集：

```env
# Gemini API（AIレシピ生成）
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# 楽天API（商品検索）
VITE_RAKUTEN_APP_ID=YOUR_RAKUTEN_APP_ID_HERE

# JAN Code Lookup API（商品検索）
VITE_JANCODE_APP_ID=YOUR_JANCODE_APP_ID_HERE

# Firebase
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN_HERE
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID_HERE
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET_HERE
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID_HERE
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID_HERE
```

### 4. Firebase Cloud Functions の設定（メール送信用）

詳細は[README_EMAIL_SETUP.md](./README_EMAIL_SETUP.md)を参照してください。

#### 簡単な手順:
1. Gmailアプリパスワードを取得
2. Firebase Functionsにシークレットとして設定:
   ```bash
   firebase functions:secrets:set GMAIL_EMAIL
   firebase functions:secrets:set GMAIL_APP_PASSWORD
   ```
3. Cloud Functionsをデプロイ:
   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   firebase deploy --only functions
   ```

### 6. 開発サーバー起動

```bash
npm run dev
```

→ http://localhost:5173

---

## 🏗️ ビルド

### プロダクションビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

→ http://localhost:4173

### GitHub Pages デプロイ

```bash
npm run deploy
```

または、GitHub Actionsで自動デプロイされます（mainブランチへのpush時に自動実行）。

---

## 📂 プロジェクト構成

```
life-pwa-react/
├── public/
│   ├── icon-192.png           # PWAアイコン
│   ├── icon-512.png
│   ├── manifest.webmanifest   # PWAマニフェスト
│   ├── sw.js                   # Service Worker
│   └── frames/                 # フレーム画像
│
├── src/
│   ├── api/
│   │   ├── gemini.ts          # Gemini API
│   │   ├── rakuten.ts         # 商品検索API
│   │   └── vision.ts           # 画像認識API
│   │
│   ├── components/
│   │   ├── layout/            # レイアウト
│   │   ├── auth/              # 認証（ログイン・登録）
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── meals/             # 食事記録
│   │   ├── settings/          # 設定
│   │   ├── stock/              # 在庫管理
│   │   ├── shopping/           # 買い物リスト
│   │   ├── recipe/             # AIレシピ
│   │   ├── barcode/            # バーコードスキャン
│   │   ├── expense/            # 家計簿
│   │   ├── report/             # レポート
│   │   ├── badges/             # バッジ
│   │   ├── goals/              # 目標管理
│   │   ├── exercise/           # 運動記録
│   │   ├── social/             # SNS機能
│   │   ├── mission/            # 日次ミッション
│   │   ├── cosmetic/           # コスメティック
│   │   └── common/              # 共通コンポーネント
│   │
│   ├── store/
│   │   ├── useIntakeStore.ts   # 食事記録ストア
│   │   ├── useExpenseStore.ts  # 家計簿ストア
│   │   ├── useStockStore.ts    # 在庫ストア
│   │   ├── useShoppingStore.ts # 買い物リストストア
│   │   ├── useRecipeStore.ts   # レシピストア
│   │   ├── useSettingsStore.ts # 設定ストア
│   │   ├── useGoalStore.ts     # 目標ストア
│   │   ├── useExerciseStore.ts # 運動記録ストア
│   │   └── useBadgeStore.ts    # バッジストア
│   │
│   ├── config/
│   │   └── firebase.ts         # Firebase設定
│   │
│   ├── types/                  # TypeScript型定義
│   ├── utils/                   # ユーティリティ関数
│   ├── data/                    # データ定義
│   ├── styles/
│   │   └── global.css          # グローバルスタイル
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── functions/                  # Cloud Functions
│   ├── src/
│   │   └── index.ts            # メール送信Function
│   ├── package.json
│   └── tsconfig.json
│
├── vite.config.ts
├── firebase.json               # Firebase設定
├── .firebaserc                 # Firebaseプロジェクト
├── firestore.rules             # Firestoreルール
├── storage.rules               # Storageルール
├── package.json
├── README.md                   # このファイル
├── README_EMAIL_SETUP.md       # メール設定手順
├── GEMINI.md                   # Gemini API情報
├── cursor.md                   # 開発用メモ（AIコーディング用）
└── .github/workflows/
    └── deploy.yml              # GitHub Actions デプロイワークフロー
```

---

## 🎨 主要機能

### 1. シームレスな機能連携

#### バーコードスキャン → 在庫管理
- スキャン後、自動で在庫画面に遷移

#### 買い物リスト → 在庫管理（目玉機能）
- グラデーションカードで強調表示
- 「買い物完了後はこちら！」のキャッチコピー
- チェック済みアイテム数をリアルタイム表示
- 成功メッセージをスライドイン（3秒後に消える）

#### 在庫管理 → 買い物リスト
- 各アイテムに🛒ボタンを表示
- ワンタップで買い物リストに追加

### 2. AI健康アドバイザー

#### ハイブリッドアプローチ
- **クライアント側チェック** - 即座に警告（APIコスト0）
- **Gemini API分析** - 詳細なパーソナライズ提案（オプション）

#### 検出カテゴリ（12種類）
1. スナック菓子（ポテトチップス等）
2. 清涼飲料水（コーラ、サイダー等）
3. インスタント食品（カップラーメン等）
4. チョコレート菓子
5. 揚げ物（唐揚げ、フライドチキン等）
6. ファストフード
7. アイスクリーム
8. 洋菓子
9. 加工肉（ベーコン、ソーセージ等）
10. エナジードリンク
11. 缶詰（シロップ漬け）
12. 高脂質調味料

### 3. X風のSNS機能

- **シンプルなタイムライン** - ホバー時に背景色が変わる
- **円形のアクションボタン** - いいね、コメント、リポスト、ブックマーク、共有
- **スレッド風の投稿詳細** - リプライへのリプライ、いいね機能
- **引用リポスト** - 元の投稿を埋め込んで表示
- **メンション機能** - @usernameでメンション
- **レシピ添付** - AIレシピを投稿に添付
- **ピン留め機能** - プロフィール画面でピン留め投稿を表示
- **通知機能** - いいね・コメント・フォロー・引用・リプライ通知

---

## 🔧 開発ガイド

### 🌐 多言語対応（i18n）方針

**⚠️ 重要な開発方針：新機能の開発時は、日本語のみで実装してください。多言語対応は最終仕上げの段階で一括して行います。**

#### 理由
- 開発効率の向上：新機能追加時に毎回8言語すべてに翻訳を追加するのは非効率的
- 機能の安定化を優先：まず機能を完成させ、その後で多言語対応を行う
- 一貫性の確保：最終仕上げで一括翻訳することで、翻訳の一貫性が保たれる

#### 対応言語
- 日本語（ja）
- 英語（en）
- 中国語簡体字（zh-CN）
- 中国語繁体字（zh-TW）
- 韓国語（ko）
- ベトナム語（vi）
- ロシア語（ru）
- インドネシア語（id）

#### 実装方法
- **ライブラリ:** `i18next` + `react-i18next`
- **設定ファイル:** `src/i18n/config.ts`
- **翻訳ファイル:** `src/i18n/locales/*.json`
- **使用方法:** `const { t } = useTranslation();` → `t('key.path')`

#### 多言語対応のタイミング
1. **開発中:** 日本語のみで実装（ハードコードされた日本語文字列でOK）
2. **最終仕上げ:** すべての日本語文字列を`t()`関数に置き換え、8言語すべてに翻訳キーを追加

#### 既存の多言語対応済み機能
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

### コーディング規約

#### CSS変数を使用
```tsx
// ❌ ダメな例
style={{ background: 'white', color: '#333' }}

// ✅ 良い例
style={{ background: 'var(--card)', color: 'var(--text)' }}
```

#### Optional Chainingを使用
```tsx
// ❌ ダメな例
recipe.ingredients.slice(0, 3)

// ✅ 良い例
recipe.ingredients && recipe.ingredients.slice(0, 3)
```

### デバッグ

#### Service Workerのクリア
```javascript
// DevTools Console
await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
location.reload();
```

#### localStorageのクリア
```javascript
localStorage.clear();
location.reload();
```

---

## 📝 ライセンス

このプロジェクトは個人学習用です。

---

## 🤝 コントリビューション

このプロジェクトは[Cursor](https://cursor.sh/)で開発されています。

詳細な開発履歴は[cursor.md](./cursor.md)を参照してください。

---

## 📚 参考資料

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Recharts Documentation](https://recharts.org/)
- [Google Gemini API](https://ai.google.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## 🎯 最近の更新（2025-01-XX）

- ✅ **目標管理機能** - カロリー・予算・体重・運動の4種類の目標設定と進捗追跡、達成通知、バッジ獲得
- ✅ **運動記録機能** - 運動名・時間・消費カロリーの記録、運動目標への自動反映、日次集計
- ✅ **ダッシュボードUI改善** - コンパクトな2カラムレイアウト、目標進捗サマリー表示
- ✅ **健康情報設定機能** - 身長・体重・年齢の設定、BMI自動計算
- ✅ **週次体重入力リマインダー** - 毎週月曜日に体重入力モーダルを表示
- ✅ **健康目標に基づく買い物リスト提案** - BMI・年齢に基づく食材提案機能
- ✅ **栄養不足分析** - 過去1週間の食事記録から不足栄養素を分析し、補完食材を提案
- ✅ **AIカロリー計測** - 料理写真からカロリーを自動推定（根拠付き）
- ✅ **プロフィール編集機能** - プロフィール画面から直接編集可能
- ✅ **DM機能改善** - DM通知、未読バッジ、会話リストの未読数表示
- ✅ **ユーザーAPIキー設定** - 設定画面で各自のGemini APIキーを設定可能
- ✅ **自動リトライ機能** - 429エラー時に自動的に再試行（約37秒後）
- ✅ **無料プラン対応** - `gemini-2.5-flash-lite`モデルを使用して無料プランでも利用可能

## 🎯 今後の予定

- [ ] Phase 7: ランキング機能（人気投稿ランキング、人気レシピランキング、トレンドハッシュタグ）
- [ ] パフォーマンス最適化（バンドルサイズ削減）
- [ ] ページ遷移アニメーション
- [ ] E2Eテスト追加（Playwright）
- [ ] アクセシビリティ向上（ARIA属性、キーボードナビゲーション）

---

**Happy Coding! 🚀**

Made with ❤️ by Cursor
