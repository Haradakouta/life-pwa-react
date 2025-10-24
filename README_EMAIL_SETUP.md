# メール送信機能のセットアップ

Firebase Cloud Functionsを使って、実際にメールを送信する機能を実装しました。

## 📧 セットアップ手順

### 1. Gmailアプリパスワードの取得

1. **Googleアカウントにアクセス**
   https://myaccount.google.com/

2. **セキュリティ** → **2段階認証プロセス** を有効化

3. **アプリパスワード** を検索して選択

4. **アプリを選択** → 「その他（カスタム名）」を選択
   - 名前: `健康家計アプリ`

5. **生成** をクリック
   - 16桁のパスワードが表示されます（例: `abcd efgh ijkl mnop`）
   - このパスワードをコピーしてください

### 2. Firebase Functionsに環境変数を設定

ターミナルで以下のコマンドを実行：

```bash
# Gmail設定
firebase functions:config:set gmail.email="your-email@gmail.com"
firebase functions:config:set gmail.password="アプリパスワード（スペースなし）"

# 例:
# firebase functions:config:set gmail.email="example@gmail.com"
# firebase functions:config:set gmail.password="abcdefghijklmnop"
```

### 3. Cloud Functionsをデプロイ

```bash
# Functionsをビルド＆デプロイ
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 4. Firebaseプロジェクトのアップグレード（必要な場合）

Firebase Functions（Cloud Functions）を使用するには、**Blazeプラン**（従量課金制）が必要です。

1. Firebaseコンソールにアクセス
   https://console.firebase.google.com/

2. プロジェクトを選択

3. 左下の **アップグレード** をクリック

4. **Blazeプラン** を選択
   - 無料枠あり（月2,000,000回の呼び出しまで無料）
   - クレジットカード登録が必要

### 5. 動作確認

1. アプリで新規登録を開始
2. メールアドレスを入力して送信
3. **実際のメールが届く**ことを確認！

## 📨 メール本文の特徴

- HTMLメール（見た目が綺麗）
- テキストメール（HTMLが表示できない環境用）
- グラデーションデザイン
- 確認コードが大きく表示
- アプリの機能説明付き
- レスポンシブデザイン対応

## 🔒 セキュリティ

- アプリパスワードは環境変数として安全に保存
- Gmailの認証情報はGitにコミットされません
- Cloud Functionsは認証が必要

## 💰 料金

**Blazeプラン（従量課金制）:**
- Functions呼び出し: 月2,000,000回まで無料
- それ以降: 100万回あたり$0.40

**通常の使用では無料枠で十分です！**

## ⚠️ トラブルシューティング

### メールが届かない場合

1. **迷惑メールフォルダを確認**
2. **Gmailアプリパスワードが正しいか確認**
   ```bash
   firebase functions:config:get
   ```
3. **Cloud Functionsのログを確認**
   ```bash
   firebase functions:log
   ```

### デプロイエラーが発生する場合

1. **Firebaseプロジェクトを確認**
   ```bash
   firebase projects:list
   firebase use osikko-paradice
   ```

2. **Node.jsのバージョンを確認**
   - 推奨: Node.js 18以上

## 📝 補足

- 開発モード: Cloud Functionsが利用できない場合、アラートで確認コードを表示（フォールバック）
- 本番環境: Gmailを使って実際のメールを送信

---

**セットアップが完了したら、実際にメールが届くようになります！**
