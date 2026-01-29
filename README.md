# けんすけ (Kensuke) - AI健康 & 家計生活管理アプリ 🏥💰

**「けんすけ」**は、日々の健康管理（食事・体重）と家計管理（買い物・在庫・支出）をひとつのアプリで完結させる、オールインワンの生活管理PWA（Progressive Web App）です。
Googleの生成AI「Gemini」を活用し、献立提案やレシート読み取り、カロリー推定などをスマートにサポートします。

## ✨ 主な機能

### 🥗 健康・食事管理
*   **食事記録**: 日々の食事を記録し、カロリーを管理。
*   **AIカロリー推定**: 食事の写真を撮るだけで、Gemini Pro Visionがカロリーと栄養素を自動推定。
*   **体重記録**: 週次リマインダー機能付きの体重管理。BMIの自動計算。
*   **AIレシピ提案**: 冷蔵庫の余り物や食べたい気分（ヘルシー、ガッツリ等）に合わせてAIがレシピを提案。

### 🛒 買い物・在庫管理
*   **在庫管理**: 食材の在庫と賞味期限を管理。期限切れ前にアラートでお知らせ。
*   **レシートスキャン**: レシートをカメラで撮影し、OCRとAIで品目・金額を自動入力。在庫や家計簿に即時反映。
*   **スマート買い物リスト**: アプリが「1週間分の買い物リスト」を自動生成（栄養バランス、節約、時短などのコース選択可）。
*   **バーコード連携**: 商品バーコードをスキャンして商品情報を取得（外部サービス連携）。

### 💰 家計管理
*   **家計簿**: 日々の支出をカテゴリ別に記録。在庫管理からの自動連携も可能。
*   **予算管理**: 月ごとの予算を設定し、達成状況を可視化。
*   **レポート**: 月次の収支や摂取カロリーの推移をグラフで分析。AIによる改善アドバイスも。

### 🎮 ゲーミフィケーション & ソーシャル
*   **バッジ & 称号**: 継続日数やアクション数（スキャン回数、カロリー目標達成など）に応じてバッジや称号を獲得。
*   **着せ替え（スキン）**: アプリのデザインをカスタマイズ可能。
*   **ソーシャル機能**: 友人とフォローし合い、食事や成果をシェア（いいね、コメント）。
*   **ミッション**: デイリーミッションをクリアしてポイント活動（設定による）。

## 🛠 技術スタック

*   **Frontend**: React 18+, TypeScript, Vite
*   **UI Framework**: Material UI (MUI), React Icons
*   **State Management**: Zustand
*   **Backend / Infrastructure**: Firebase (Authentication, Firestore, Storage, Cloud Functions, Hosting)
*   **AI**: Google Gemini API (Pro & Flash models)
*   **PWA**: Service Workers with Offline Support, Install Prompt
*   **Monitoring**: Error Boundary integration

## 🚀 セットアップ手順

### 前提条件
*   Node.js (v20以上推奨)
*   npm

### インストール
```bash
# リポジトリのクローン
git clone <repository-url>
cd life-pwa-react

# 依存関係のインストール
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```

### ビルドとデプロイ
```bash
# ビルドのみ
npm run build

# Firebase Hostingへのデプロイ
npm run deploy:hosting

# Cloud Functionsへのデプロイ
npm run deploy:functions
```

## ⚠️ 注意事項・既知の問題
*   **AI生成の精度**: Geminiの応答により、時折フォーマットが崩れる場合がありますが、修正ロジックにより安定化を図っています。
*   **ブラウザ互換性**: 最新のChromeまたはSafariでの利用を推奨します。iOSではPWAインストールに「共有 > ホーム画面に追加」の手順が必要です。

## 👨‍💻 開発者へのメッセージ
このプロジェクトは「生活を少しでも便利に、楽しくすること」を目指して開発されました。
まだバグは残っていますが、基本的なエコシステムは完成しています。
Forkして機能追加するもよし、自分の生活に合わせてカスタマイズするもよし。

**Enjoy your healthy & wealthy life with Kensuke!**
