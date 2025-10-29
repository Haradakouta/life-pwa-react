# 🔥 CORS エラー修正ガイド（GUI で設定）

## ⚠️ 現在の問題

画像アップロード時に以下のエラーが発生:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...'
from origin 'https://haradakouta.github.io' has been blocked by CORS policy
```

## 🚨 重要: Firebase Storage が有効か確認

**まず、Firebase Storage が有効になっているか確認してください。**

1. https://console.firebase.google.com/project/oshi-para/storage にアクセス
2. バケット `oshi-para.firebasestorage.app` または `oshi-para.appspot.com` が表示されているか確認

**もしバケットが存在しない場合:**
- `FIREBASE_STORAGE_SETUP.md` を参照して、Firebase Storage を有効化してください
- Storage が有効化されるまで、このガイドは使えません

---

## 🎯 解決方法（3ステップ、CLIは不要！）

### ステップ1: Firebase Storage Rules を更新（Firebase Console）

**1-1. Firebase Console にアクセス:**
- https://console.firebase.google.com/project/oshi-para/storage/rules

**1-2. 以下のルールをコピペして「公開」ボタンをクリック:**

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

**⚠️ 重要:** 上記のルールは `avatars/{userId}/*` という**新しいパス構造**に対応しています。古いルール（`users/{userId}/profile/avatar/*`）とは異なります。

---

### ステップ2: CORS 設定を適用（Google Cloud Console）

**2-1. Google Cloud Console にアクセス:**
- https://console.cloud.google.com/storage/browser?project=oshi-para

**2-2. バケットを選択:**
- `oshi-para.firebasestorage.app` をクリック

**2-3. 「設定」タブ → 「CORS の設定」→「編集」をクリック**

**2-4. 以下のJSONをコピペして「保存」:**

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

**📝 説明:**
- `origin`: アクセスを許可するドメイン
- `method`: 許可するHTTPメソッド
- `maxAgeSeconds`: プリフライトリクエストのキャッシュ時間（1時間）
- `responseHeader`: 許可するレスポンスヘッダー

---

### ステップ3: 確認とテスト

**3-1. ブラウザキャッシュをクリア**

Chrome/Edge:
```
Ctrl + Shift + Delete → キャッシュされた画像とファイル → データを削除
```

**3-2. シークレットモードで確認**

新しいシークレットウィンドウで:
```
https://haradakouta.github.io/life-pwa-react/
```

**3-3. 画像アップロードをテスト**

1. ログイン
2. 設定 → プロフィール編集
3. アイコン画像を変更
4. エラーが出ないことを確認

---

## 🔍 トラブルシューティング

### エラー: まだCORSエラーが出る

**対策1: 設定の反映を待つ**
- CORS設定は反映に5〜10分かかることがあります
- 少し待ってから再試行してください

**対策2: ハードリフレッシュ**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

**対策3: Service Worker をクリア**

DevTools Console で実行:
```javascript
await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
location.reload();
```

### エラー: Permission denied

**原因:** Storage Rules が更新されていない

**対策:**
- ステップ1を再確認
- Firebase Console で「公開」ボタンを押したか確認
- Storage Rules のパスが `avatars/{userId}/*` になっているか確認

### エラー: Invalid CORS configuration

**原因:** CORS JSONの形式が間違っている

**対策:**
- ステップ2のJSONを**完全にコピペ**してください
- カンマやカッコの位置を確認してください

---

## 📋 チェックリスト

確認したら ✅ をつけてください:

- [ ] Firebase Storage Rules を更新して「公開」した
- [ ] Google Cloud Console で CORS 設定を保存した
- [ ] ブラウザキャッシュをクリアした
- [ ] シークレットモードでテストした
- [ ] 5〜10分待った（設定反映のため）

---

## 🆘 それでも解決しない場合

以下の情報を確認してください:

1. **Firebase Console → Storage → Rules タブ**
   - 「公開日時」が最新になっているか確認

2. **Google Cloud Console → Cloud Storage**
   - CORS設定が表示されているか確認

3. **ブラウザの DevTools → Console タブ**
   - 具体的なエラーメッセージをコピー
   - Network タブでリクエストのステータスコードを確認

4. **Firebase Authentication → Settings → 承認済みドメイン**
   - `haradakouta.github.io` が追加されているか確認

---

## 💡 補足: CLI を使う方法（任意）

もし CLI を使いたい場合は、`FIREBASE_DEPLOY.md` を参照してください。

ただし、上記の GUI 方法の方が簡単で確実です。
