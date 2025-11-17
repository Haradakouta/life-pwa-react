# Gemini API 代替案調査レポート

## 📋 調査日
2025年1月

## 🔍 現在のGemini API使用状況

### 使用している機能一覧

1. **AIレシピ生成** (`generateRecipe`)
   - 機能: 材料からレシピを生成
   - モデル: `gemini-2.0-flash-exp`
   - ファイル: `src/api/gemini.ts`

2. **テキスト生成** (`generateText`)
   - 機能: 月次レポートのAI改善提案など
   - モデル: `gemini-2.0-flash-exp`
   - ファイル: `src/api/gemini.ts`

3. **レシートOCR** (`scanReceipt`)
   - 機能: レシート画像から商品情報を抽出（画像認識 + 構造化）
   - モデル: `gemini-2.5-flash-lite`
   - ファイル: `src/api/gemini.ts`

4. **カロリー計測** (`scanCalorie`)
   - 機能: 料理画像からカロリーを推定（画像認識 + 推論）
   - モデル: `gemini-2.5-flash-lite`
   - ファイル: `src/api/gemini.ts`

5. **AI健康分析** (`getAIHealthAnalysis`)
   - 機能: 商品の健康面での懸念点を分析
   - モデル: `gemini-2.0-flash-exp`
   - ファイル: `src/utils/healthAdvisor.ts`

6. **健康買い物リスト提案** (`getHealthBasedShoppingList`)
   - 機能: 健康目標に基づいた買い物リストを提案
   - モデル: `gemini-2.5-flash-lite`
   - ファイル: `src/utils/healthShopping.ts`

## ❌ LINE Works APIへの差し替え可能性

### 調査結果

**結論: 完全な代替は不可能**

### 理由

1. **機能の違い**
   - LINE Works APIは主に**OCR機能**に特化
   - Gemini APIが提供する**生成AI機能**（テキスト生成、画像推論）は提供していない

2. **提供機能の比較**

| 機能 | Gemini API | LINE Works API |
|------|-----------|----------------|
| テキスト生成 | ✅ | ❌ |
| 画像認識（OCR） | ✅ | ✅ |
| 画像推論（カロリー推定など） | ✅ | ❌ |
| 構造化データ抽出 | ✅ | ⚠️ 限定的 |

3. **実装上の問題**
   - レシートOCR: LINE Works APIで代替可能（ただし構造化の精度が異なる可能性）
   - レシピ生成: **代替不可**（LINE Works APIに該当機能なし）
   - カロリー計測: **代替不可**（画像推論機能なし）
   - テキスト生成: **代替不可**（生成AI機能なし）
   - 健康分析: **代替不可**（生成AI機能なし）
   - 健康買い物リスト: **代替不可**（生成AI機能なし）

## 🔄 代替案の検討

### 1. OpenAI API (GPT-4 / GPT-4 Vision)

**メリット:**
- ✅ テキスト生成機能が強力
- ✅ GPT-4 Visionで画像認識・推論が可能
- ✅ 日本語対応が良好
- ✅ 安定したサービス

**デメリット:**
- ❌ コストが高い（Geminiより高価）
- ❌ APIキーの管理が必要
- ❌ レート制限あり

**実装可能性:** ⭐⭐⭐⭐⭐ (高い)

### 2. Anthropic Claude API

**メリット:**
- ✅ テキスト生成機能が強力
- ✅ 日本語対応が良好
- ✅ 安全性に配慮された設計

**デメリット:**
- ❌ 画像認識機能が限定的（Claude 3.5 Sonnet以降で対応）
- ❌ コストが高い
- ❌ APIキーの管理が必要

**実装可能性:** ⭐⭐⭐⭐ (中高)

### 3. Azure OpenAI Service

**メリット:**
- ✅ OpenAIのモデルをAzure上で利用可能
- ✅ エンタープライズ向けのセキュリティ
- ✅ 日本リージョン対応

**デメリット:**
- ❌ コストが高い
- ❌ Azureアカウントが必要
- ❌ 設定が複雑

**実装可能性:** ⭐⭐⭐ (中)

### 4. 複数APIの組み合わせ

**案1: OpenAI API + LINE Works API**
- テキスト生成: OpenAI API
- OCR: LINE Works API
- 画像推論: OpenAI GPT-4 Vision

**案2: Claude API + 専用OCRサービス**
- テキスト生成: Claude API
- OCR: Tesseract OCR / Google Cloud Vision API
- 画像推論: Claude API

## 💡 推奨案

### 短期対応（Gemini APIが復旧するまで）

1. **エラーハンドリングの強化**
   - より詳細なエラーログ
   - リトライ機能の改善
   - フォールバック機能の追加

2. **モックデータの充実**
   - APIが使用できない場合の代替データを準備

### 中期対応（代替APIの検討）

1. **OpenAI APIへの移行**
   - 最も実装が容易
   - 機能がGemini APIと同等以上
   - ただしコストが高い

2. **段階的な移行**
   - まずレシピ生成機能から移行
   - 次にOCR機能
   - 最後に画像推論機能

### 長期対応（複数APIの組み合わせ）

1. **API抽象化レイヤーの実装**
   - 複数のAPIプロバイダーに対応
   - プロバイダーの切り替えが容易に

2. **コスト最適化**
   - 用途に応じて最適なAPIを選択
   - 例: OCRはLINE Works、生成AIはOpenAI

## 📊 実装コスト比較

| 代替案 | 実装難易度 | コスト | 機能の完全性 |
|--------|-----------|--------|-------------|
| LINE Works API | ⭐⭐⭐⭐⭐ | 低 | ⭐ (OCRのみ) |
| OpenAI API | ⭐⭐ | 高 | ⭐⭐⭐⭐⭐ |
| Claude API | ⭐⭐⭐ | 高 | ⭐⭐⭐⭐ |
| Azure OpenAI | ⭐⭐⭐⭐ | 高 | ⭐⭐⭐⭐⭐ |
| 複数API組み合わせ | ⭐⭐⭐⭐⭐ | 中〜高 | ⭐⭐⭐⭐⭐ |

## 🎯 結論

1. **LINE Works APIへの完全な差し替えは不可能**
   - OCR機能のみ代替可能
   - 生成AI機能は代替不可

2. **推奨される代替案**
   - **最優先**: OpenAI API（機能の完全性が高い）
   - **次点**: Claude API（安全性に優れる）
   - **コスト重視**: 複数APIの組み合わせ

3. **実装方針**
   - まずはGemini APIの復旧を待つ
   - 並行してOpenAI APIへの移行準備を進める
   - API抽象化レイヤーを実装して、将来的に複数プロバイダーに対応

## 📝 次のステップ

1. Gemini APIの障害状況を継続的に監視
2. OpenAI APIの試用アカウントを取得して検証
3. API抽象化レイヤーの設計・実装
4. 段階的な移行計画の策定


