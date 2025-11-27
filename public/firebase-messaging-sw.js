importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase設定（環境変数から読み込めないため、ハードコードまたはビルド時に注入が必要ですが、
// Service Worker内では環境変数が使えないため、ここでは直接記述するか、
// 別の方法で渡す必要があります。今回は簡略化のため、主要な設定のみ記載します。
// 本番環境では適切な設定値に置き換えてください。）
// 注意: Service Workerは独立したスレッドで動作するため、メインスレッドのENVにはアクセスできません。
// ユーザーのfirebaseConfigに合わせて設定する必要があります。

const firebaseConfig = {
    // ユーザーのプロジェクト設定に合わせてください
    apiKey: "YOUR_API_KEY",
    authDomain: "oshi-para.firebaseapp.com",
    projectId: "oshi-para",
    storageBucket: "oshi-para.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// Messaging初期化
const messaging = firebase.messaging();

// バックグラウンドメッセージのハンドリング
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png', // アプリのアイコン
        badge: '/icon-192.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 通知クリック時の動作
self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click Received.', event);
    event.notification.close();

    // アプリを開く
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // 既に開いているウィンドウがあればフォーカス
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // なければ新規オープン
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
