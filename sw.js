/**
 * Service Worker
 * オフライン対応とキャッシュ管理
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `life-pwa-react-${CACHE_VERSION}`;

// キャッシュするリソース
const STATIC_RESOURCES = [
  '/life-pwa-react/',
  '/life-pwa-react/index.html',
  '/life-pwa-react/manifest.webmanifest',
  '/life-pwa-react/icon-192.png',
  '/life-pwa-react/icon-512.png',
];

// インストール時
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static resources');
      return cache.addAll(STATIC_RESOURCES).catch((err) => {
        console.error('[SW] Failed to cache resources:', err);
      });
    })
  );

  // 新しいService Workerを即座にアクティブ化
  self.skipWaiting();
});

// アクティベート時
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // 既存のクライアントを即座に制御
  self.clients.claim();
});

// フェッチ時（ネットワーク優先戦略）
self.addEventListener('fetch', (event) => {
  // POSTリクエストやAPIリクエストはキャッシュしない
  if (event.request.method !== 'GET') {
    return;
  }

  // Chrome拡張機能のリクエストは無視
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // レスポンスが有効な場合のみキャッシュ
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから返す
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', event.request.url);
            return cachedResponse;
          }

          // キャッシュにもない場合は、HTMLリクエストならindex.htmlを返す
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/life-pwa-react/index.html');
          }

          // それ以外はエラーレスポンスを返す
          return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

// メッセージ受信時
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
