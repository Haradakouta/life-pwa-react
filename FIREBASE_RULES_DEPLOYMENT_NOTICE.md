# ⚠️ Firestoreルールのデプロイが必要です

**作成日**: 2025-01-28
**重要度**: 🔴 高

---

## 📋 現在の状況

`errorLogs`コレクションのルールを`firestore.rules`に追加しましたが、**まだデプロイされていません**。

Firestoreルールをデプロイしないと、エラーログが保存できません。

---

## 🚀 デプロイ手順

### 方法1: Firebase CLI（推奨）

```bash
# Firestoreルールをデプロイ
firebase deploy --only firestore:rules
```

### 方法2: Firebase Console

1. [Firebase Console](https://console.firebase.google.com) にアクセス
2. プロジェクト `oshi-para` を選択
3. **Firestore Database** → **ルール** タブを開く
4. `firestore.rules` ファイルの内容を全てコピー
5. ルールエディタに貼り付け
6. **公開** をクリック

---

## ✅ デプロイ後の確認

1. **Firebase Console** → **Firestore Database** → **データ** タブ
2. エラーが発生すると、自動的に `errorLogs` コレクションが作成されます
3. エラーログが表示されることを確認

---

## 🧪 テスト方法

エラーログが正しく保存されるかテストするには：

1. ブラウザのコンソールを開く
2. 以下のコードを実行：
```javascript
throw new Error('テストエラー');
```
3. Firebase Consoleで `errorLogs` コレクションにエラーが保存されているか確認

---

## 📝 注意事項

- Firestoreルールのデプロイは、**Firebase CLIが使える別PC**で実行する必要があります
- 現在のPCでは、OAuth Appのスコープの問題でFirebase CLIのデプロイができない可能性があります
- Firebase Consoleから直接ルールをコピー&ペーストする方法が最も簡単です

---

## 🔗 関連ファイル

- `firestore.rules` - Firestoreセキュリティルール
- `FIREBASE_DEPLOY_COMMANDS.md` - デプロイコマンド集
- `ERROR_LOGGING_GUIDE.md` - エラーログ機能のガイド





