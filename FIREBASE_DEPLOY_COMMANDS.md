# 🔐 Firebase デプロイ コピペコマンド集

**あなたのPC（haradakoutaのPC）で実行用**

---

## 📋 実行順序

### 1️⃣ Firebase CLI インストール（初回のみ）

```bash
npm install -g firebase-tools
```

---

### 2️⃣ Firebase ログイン（初回のみ）

```bash
firebase login
```

ブラウザでログインして、認証を完了します。

---

### 3️⃣ プロジェクト確認

```bash
firebase projects:list
```

出力例：
```
oshi-para (oshi-para-xxxxx)
```

---

### 4️⃣ ドライラン（構文エラー確認）必須！

```bash
firebase deploy --only firestore:rules,storage --dry-run
```

✅ 出力に「validated」と表示されたら次へ進む
❌ エラーが出たら修正が必要

---

### 5️⃣ 本番デプロイ

```bash
firebase deploy --only firestore:rules,storage
```

✔️ 完了メッセージが表示されたら成功！

---

## 🔥 クイック実行（4コマンド）

初回セットアップ後は、これだけで実行可能：

```bash
# ステップ1: ドライラン
firebase deploy --only firestore:rules,storage --dry-run

# ステップ2: 本番デプロイ
firebase deploy --only firestore:rules,storage
```

---

## 📝 デプロイ前のチェック

実行前に確認（ブラウザで確認）：

1. **Firebase Console** にログイン：
   https://console.firebase.google.com

2. **Firestore Database** が作成されているか確認
   - プロジェクト名をクリック
   - 左メニューの「Firestore Database」を確認
   - ❌ なければ「データベースを作成」をクリック

3. **Firebase Storage** が作成されているか確認
   - 左メニューの「Storage」を確認
   - ❌ なければ「バケットを作成」をクリック

---

## 🧪 デプロイ後のテスト

アプリで以下が動作するか確認：

- [ ] ユーザー登録・ログイン
- [ ] プロフィール画像アップロード
- [ ] 投稿作成・表示・削除
- [ ] いいね・コメント
- [ ] フォロー・アンフォロー
- [ ] レシピ共有
- [ ] 他ユーザーデータが見えないことを確認

---

## ⚠️ エラーが出た場合

| エラーメッセージ | 原因 | 対応 |
|----------------|------|------|
| `Error: Cannot find project` | プロジェクトが見つからない | `firebase projects:list` で確認 |
| `Error: Invalid rules` | 構文エラー | `--dry-run` で詳細確認 |
| `Error: Firestore not initialized` | Firestore DB未作成 | Firebase Console で作成 |
| `Error: Storage bucket not found` | Storage 未作成 | Firebase Console で作成 |

---

## 🎯 最小限のコマンド（急ぐ場合）

このコマンドだけで完了：

```bash
firebase login && firebase deploy --only firestore:rules,storage --dry-run && firebase deploy --only firestore:rules,storage
```

---

## 📍 デプロイ後の確認

Firebase Console で確認：

```bash
# Firestore ルール確認
https://console.firebase.google.com/project/oshi-para-xxxxx/firestore/rules

# Storage ルール確認
https://console.firebase.google.com/project/oshi-para-xxxxx/storage/rules
```

---

## 🔄 後で修正が必要な場合

ルールを修正して再デプロイ：

```bash
# firestore.rules または storage.rules を編集して保存

# ドライランで確認
firebase deploy --only firestore:rules,storage --dry-run

# 修正内容に問題なければデプロイ
firebase deploy --only firestore:rules,storage
```

---

## ✅ まとめ

### 初回セットアップ
```bash
npm install -g firebase-tools
firebase login
firebase projects:list
```

### デプロイ（毎回実行）
```bash
firebase deploy --only firestore:rules,storage --dry-run
firebase deploy --only firestore:rules,storage
```

**以上！これだけです！** 🎉

---

**haradakoutaのPCで実行してください**

質問があれば聞いてください！

