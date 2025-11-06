# ⚠️ Firestoreルールの更新が必要です

**作成日**: 2025-01-28
**重要度**: 🔴 高

---

## 📋 現在の状況

`errorLogs`コレクションのルールを`firestore.rules`に追加しましたが、**Firestoreルールをデプロイする必要があります**。

Firestoreルールをデプロイしないと、エラーログが保存できません。

---

## 🚀 デプロイ方法

### 方法1: Firebase Console（最も簡単）

1. **Firebase Console**を開く
   - URL: https://console.firebase.google.com/project/oshi-para/firestore/rules

2. **ルールエディタ**を開く
   - Firestore Database → **ルール**タブをクリック

3. **`firestore.rules`の内容をコピー**
   - ローカルの`firestore.rules`ファイルを開く
   - 内容を全てコピー（Ctrl+A → Ctrl+C）

4. **ルールエディタに貼り付け**
   - Firebase Consoleのルールエディタに貼り付け（Ctrl+V）

5. **公開**
   - **公開**ボタンをクリック
   - 確認ダイアログで**公開**をクリック

### 方法2: Firebase CLI（別PCで実行）

```bash
# Firestoreルールをデプロイ
firebase deploy --only firestore:rules
```

**注意**: 現在のPCではOAuth Appのスコープの問題でFirebase CLIのデプロイができない可能性があります。

---

## ✅ デプロイ後の確認

1. **Firebase Console** → **Firestore Database** → **ルール**タブ
2. ルールに`errorLogs`の設定が含まれているか確認：
```javascript
// エラーログ（誰でも書き込み可能、管理者のみ読み取り可能）
match /errorLogs/{logId} {
  allow create: if true; // 誰でもエラーログを書き込める
  allow read: if isAuth(); // 認証済みユーザーは読み取り可能
  allow update, delete: if false; // 更新・削除は不可
}
```

---

## 🧪 テスト方法

エラーログが正しく保存されるかテスト：

1. **ブラウザのコンソール**を開く（F12）
2. **以下のコードを実行**：
```javascript
throw new Error('テストエラー');
```
3. **Firebase Console**で確認
   - Firestore Database → **データ**タブ
   - `errorLogs`コレクションが作成され、エラーログが保存されているか確認

---

## 📝 注意事項

- `errorLogs`コレクションは、**最初のエラーが発生したときに自動的に作成**されます
- エラーが発生していない場合、コレクションは存在しません（正常です）
- ルールをデプロイした後、エラーが発生すると自動的にコレクションが作成されます

---

## 🔗 関連ファイル

- `firestore.rules` - Firestoreセキュリティルール（187-191行目に`errorLogs`のルールが追加されています）
- `FIREBASE_DEPLOY_COMMANDS.md` - デプロイコマンド集
- `ERROR_LOGGING_GUIDE.md` - エラーログ機能の詳細ガイド





