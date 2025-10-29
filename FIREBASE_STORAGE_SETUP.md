# 🔥 Firebase Storage 有効化ガイド

## ⚠️ 現在の問題

Firebase Storageが有効になっていないため、バケット `oshi-para.firebasestorage.app` が存在しません。

画像アップロード機能を使うには、まずFirebase Storageを有効化する必要があります。

---

## 🚀 Firebase Storage 有効化手順（5分）

### ステップ1: Firebase Console にアクセス

**Firebase Console を開く:**
- https://console.firebase.google.com/project/oshi-para/storage

または:

1. https://console.firebase.google.com/ にアクセス
2. プロジェクト「oshi-para」を選択
3. 左メニューから「Storage」をクリック

---

### ステップ2: Storage を有効化

**初めて Storage を開く場合:**

1. **「始める」または「Get Started」ボタンをクリック**

2. **セキュリティルールの選択:**
   - 「本番環境モードで開始」を選択
   - 「次へ」をクリック

3. **ロケーションの選択:**
   - 「asia-northeast1 (Tokyo)」を選択
   - 「完了」をクリック

**⏱ 数秒〜1分ほど待つと、Storage が有効化されます。**

---

### ステップ3: Storage バケットの確認

**有効化が完了したら:**

1. Firebase Console の Storage タブで、以下のバケットが表示されているか確認:
   ```
   oshi-para.firebasestorage.app
   ```
   または
   ```
   oshi-para.appspot.com
   ```

2. **もし `oshi-para.appspot.com` の場合:**
   - `.env` ファイルのバケット名を更新する必要があります
   - 次のステップに進んでください

---

### ステップ4: バケット名の確認と修正（必要な場合のみ）

**バケット名が `oshi-para.appspot.com` の場合:**

1. **このリポジトリの `.env` ファイルを編集:**

```env
# 変更前
VITE_FIREBASE_STORAGE_BUCKET=oshi-para.firebasestorage.app

# 変更後（実際のバケット名に合わせる）
VITE_FIREBASE_STORAGE_BUCKET=oshi-para.appspot.com
```

2. **変更を保存してコミット:**

```bash
git add .env
git commit -m "Update Firebase Storage bucket name"
git push
```

3. **アプリを再ビルド・デプロイ:**

```bash
npm run build
npm run deploy
```

**⚠️ 重要:** `.env` ファイルは通常 `.gitignore` に含まれているので、GitHub Actions を使っている場合は環境変数を更新する必要があります。

---

### ステップ5: Storage Rules の設定

**Firebase Console で Storage Rules を設定:**

1. **Firebase Console → Storage → Rules タブ**
   - https://console.firebase.google.com/project/oshi-para/storage/rules

2. **以下のルールをコピペして「公開」:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // ========================================
    // ユーザープロフィール画像
    // ========================================

    // アバター画像: avatars/{userId}/*
    match /avatars/{userId}/{file=**} {
      // 読み取り: 誰でも可能（公開プロフィール画像）
      allow read: if true;

      // アップロード: 自分のアバターのみ
      // 10MB以下、JPEG/PNG/GIF/WebP形式
      allow create, write: if request.auth != null
                           && request.auth.uid == userId
                           && request.resource.size < 10 * 1024 * 1024
                           && request.resource.contentType in ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      // 削除: 自分のアバターのみ削除可能
      allow delete: if request.auth != null
                    && request.auth.uid == userId;
    }

    // カバー画像: covers/{userId}/*
    match /covers/{userId}/{file=**} {
      // 読み取り: 誰でも可能（公開プロフィール画像）
      allow read: if true;

      // アップロード: 自分のカバーのみ
      // 10MB以下、JPEG/PNG/GIF/WebP形式
      allow create, write: if request.auth != null
                           && request.auth.uid == userId
                           && request.resource.size < 10 * 1024 * 1024
                           && request.resource.contentType in ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      // 削除: 自分のカバーのみ削除可能
      allow delete: if request.auth != null
                    && request.auth.uid == userId;
    }

    // ========================================
    // 投稿画像
    // ========================================

    // 投稿画像: posts/{userId}/*
    match /posts/{userId}/{file=**} {
      // 読み取り: 誰でも可能（公開投稿画像）
      allow read: if true;

      // アップロード: 認証済みユーザーのみ（自分のフォルダ）
      // 15MB以下（複数枚対応）、JPEG/PNG/GIF/WebP形式
      allow create: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.size < 15 * 1024 * 1024
                    && request.resource.contentType in ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      // 削除: 自分の投稿画像のみ
      allow delete: if request.auth != null
                    && request.auth.uid == userId;
    }

    // ========================================
    // レシピ共有画像
    // ========================================

    // レシピ画像: recipes/{userId}/*
    match /recipes/{userId}/{file=**} {
      // 読み取り: 誰でも可能（公開レシピ画像）
      allow read: if true;

      // アップロード: 認証済みユーザーのみ（自分のフォルダ）
      // 15MB以下、JPEG/PNG/GIF/WebP形式
      allow create: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.size < 15 * 1024 * 1024
                    && request.resource.contentType in ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      // 削除: 自分のレシピ画像のみ
      allow delete: if request.auth != null
                    && request.auth.uid == userId;
    }

    // ========================================
    // デフォルト: すべてのパスはアクセス不可
    // ========================================

    // その他のパスは全てアクセス不可
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

3. **「公開」ボタンをクリック**

---

### ステップ6: CORS 設定を適用（オプション、推奨）

**Google Cloud Console で CORS を設定:**

1. **Google Cloud Console にアクセス:**
   - https://console.cloud.google.com/storage/browser?project=oshi-para

2. **バケットを選択:**
   - `oshi-para.firebasestorage.app` または `oshi-para.appspot.com` をクリック

3. **「設定」タブ → 「CORS の設定」→「編集」をクリック**

4. **以下のJSONをコピペして「保存」:**

```json
[
  {
    "origin": ["https://haradakouta.github.io", "http://localhost:5173"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

---

### ステップ7: テスト

**画像アップロードをテスト:**

1. **ブラウザキャッシュをクリア:**
   - `Ctrl + Shift + Delete` → キャッシュ削除

2. **アプリにアクセス:**
   - https://haradakouta.github.io/life-pwa-react/

3. **画像アップロードをテスト:**
   - ログイン → 設定 → プロフィール編集 → アイコン変更

4. **エラーが出ないことを確認**

---

## 📋 チェックリスト

確認したら ✅ をつけてください:

- [ ] Firebase Storage を有効化した
- [ ] バケット名を確認した（`oshi-para.firebasestorage.app` または `oshi-para.appspot.com`）
- [ ] 必要に応じて `.env` のバケット名を更新した
- [ ] Storage Rules を設定して「公開」した
- [ ] CORS設定を適用した（オプション）
- [ ] ブラウザキャッシュをクリアした
- [ ] 画像アップロードをテストした

---

## 🔍 トラブルシューティング

### エラー: バケットが見つからない

**対策:**
- Firebase Storage が完全に有効化されるまで数分待つ
- ページをリフレッシュする
- Firebase Console からログアウト・ログインする

### エラー: Permission denied

**対策:**
- Storage Rules が正しく設定されているか確認
- 「公開」ボタンを押したか確認
- ユーザーがログインしているか確認

### エラー: CORS エラー

**対策:**
- ステップ6のCORS設定を適用する
- 5〜10分待って設定が反映されるのを待つ
- ブラウザキャッシュをクリアする

---

## 📌 次のステップ

Storage の有効化が完了したら、`CORS_FIX_GUIDE.md` を参照して CORS 設定を完了してください。

---

## 💡 補足情報

**Firebase Storage の料金:**
- Spark プラン（無料）: 5GB まで無料、ダウンロード 1GB/日まで無料
- Blaze プラン（従量課金）: 上限なし、従量課金

**プロジェクト oshi-para は Blaze プランなので、Storage も使用可能です。**
