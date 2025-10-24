# EmailJS セットアップガイド（完全無料・5分で完了）

EmailJSを使って、**課金なし・クレジットカード不要**でメール送信機能を実装します。

## ✨ EmailJSの特徴

- ✅ **完全無料**（月200通まで）
- ✅ **クレジットカード不要**
- ✅ **Firebase Functions不要**
- ✅ **フロントエンドから直接送信**
- ✅ **5分でセットアップ完了**

---

## 📝 セットアップ手順

### 1. EmailJSアカウントを作成

1. https://www.emailjs.com/ にアクセス
2. 右上の **「Sign Up」** をクリック
3. メールアドレスとパスワードを入力して登録
4. 確認メールのリンクをクリック

### 2. Email Serviceを追加

1. EmailJSダッシュボードにログイン
2. 左メニューの **「Email Services」** をクリック
3. **「Add New Service」** をクリック
4. **Gmail** を選択（他のメールサービスでもOK）
5. **「Connect Account」** をクリック
6. Googleアカウントでログイン
7. Service IDをコピー（例: `service_abc123`）

### 3. Email Templateを作成

1. 左メニューの **「Email Templates」** をクリック
2. **「Create New Template」** をクリック
3. Template Nameに「Verification Code」と入力
4. 以下のテンプレートを貼り付け：

#### **Subject（件名）:**
```
【{{app_name}}】メール確認コード
```

#### **Content（本文）:**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .code-box {
      background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 8px;
      margin: 10px 0;
    }
    .info {
      background: #e8f5e9;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .features {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .features ul {
      padding-left: 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🥗💰 {{app_name}}</h1>
    <p>メール確認コード</p>
  </div>

  <div class="content">
    <p>こんにちは！</p>
    <p>{{app_name}}へのご登録ありがとうございます。</p>
    <p>以下の確認コードを入力して、メールアドレスの確認を完了してください：</p>

    <div class="code-box">
      <div>確認コード</div>
      <div class="code">{{code}}</div>
    </div>

    <div class="info">
      <p><strong>ご注意：</strong></p>
      <ul>
        <li>このコードは <strong>10分間</strong> 有効です</li>
        <li>このメールに心当たりがない場合は、無視していただいて構いません</li>
        <li>確認コードは他人に教えないでください</li>
      </ul>
    </div>

    <div class="features">
      <h3>{{app_name}}について</h3>
      <p>AIが健康をサポートする生活管理アプリです</p>
      <ul>
        <li>✓ 食事記録とカロリー管理</li>
        <li>✓ AIレシピ生成（Gemini API）</li>
        <li>✓ 家計簿機能（カテゴリ別集計）</li>
        <li>✓ 在庫管理（期限切れアラート）</li>
        <li>✓ バーコードスキャン（商品検索）</li>
        <li>✓ レシートOCR（自動読み取り）</li>
      </ul>
    </div>
  </div>

  <div class="footer">
    <p>© 2025 {{app_name}}</p>
    <p><a href="{{app_url}}">{{app_url}}</a></p>
    <p>このメールは自動送信されています。返信はできません。</p>
  </div>
</body>
</html>
```

5. **「Save」** をクリック
6. Template IDをコピー（例: `template_xyz789`）

### 4. Public Keyを取得

1. 左メニューの **「Account」** をクリック
2. **「General」** タブを選択
3. **Public Key** をコピー（例: `AbCdEfGhIjKlMnOp`）

### 5. .envファイルに設定

`.env` ファイルを開いて、以下を追加：

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOp
```

**注意**: `service_abc123` などは実際の値に置き換えてください。

### 6. 動作確認

1. アプリを再起動
   ```bash
   npm run dev
   ```

2. 新規登録画面でメールアドレスを入力

3. **実際のメールが届く！** 🎉

---

## 📧 To EmailとFrom Email

EmailJSでは、テンプレートに以下の変数を使用します：

- `{{to_email}}` - 送信先メールアドレス（自動設定）
- `{{from_name}}` - 送信者名（EmailJSダッシュボードで設定）
- `{{code}}` - 確認コード
- `{{app_name}}` - アプリ名
- `{{app_url}}` - アプリURL

### 送信者名の設定

1. Email Templates → 作成したテンプレートを開く
2. **Settings** タブを選択
3. **From Name** に「健康家計アプリ」と入力
4. **From Email** は自動設定（Gmailの場合はGoogleアカウントのメール）
5. **To Email** に `{{to_email}}` と入力
6. **Save** をクリック

---

## 💰 無料枠

**月200通まで完全無料**

- 新規登録時: 1通
- パスワードリセット時: 1通（今後実装予定）
- 二段階認証時: 1通（今後実装予定）

通常の使用では200通で十分です！

---

## 🚀 デプロイ

設定が完了したら：

```bash
npm run build
npm run deploy
```

GitHub Pagesにデプロイ後、実際のメールが送信されます！

---

## ⚠️ トラブルシューティング

### メールが届かない場合

1. **迷惑メールフォルダを確認**
2. **EmailJSダッシュボードのログを確認**
   - Dashboard → Usage
3. **.envファイルの設定を確認**
   ```bash
   # .envファイルを開いて確認
   cat .env
   ```
4. **ブラウザのコンソールを確認**
   - F12 → Console タブ

### エラーが出る場合

- Service IDが正しいか確認
- Template IDが正しいか確認
- Public Keyが正しいか確認
- EmailJSダッシュボードでServiceが「Active」になっているか確認

---

## 📝 補足

- **セキュリティ**: Public Keyは公開されても問題ありません（フロントエンド用）
- **送信制限**: EmailJSのダッシュボードで送信数を確認できます
- **カスタマイズ**: テンプレートは自由にカスタマイズ可能

---

**これで完了です！実際にメールが届くようになりました 🎉**
