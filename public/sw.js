/**
 * Service Worker
 * オフライン対応とキャッシュ管理
 */

const CACHE_VERSION = 'v3';
const CACHE_NAME = `life-pwa-react-${CACHE_VERSION}`;

// キャッシュするリソース
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
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

// フェッチ時（ネットワーク優先戦略、アセットファイルはキャッシュしない）
self.addEventListener('fetch', (event) => {
  // POSTリクエストやAPIリクエストはキャッシュしない
  if (event.request.method !== 'GET') {
    return;
  }

  // Chrome拡張機能のリクエストは無視
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  const url = new URL(event.request.url);

  // アセットファイル（/assets/）はキャッシュしない（常にネットワークから取得）
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // ネットワークエラー時のみエラーを返す（キャッシュからは返さない）
        return new Response('Failed to fetch asset', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 静的リソース（HTML、manifest、アイコンなど）のみキャッシュ
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから返す（静的リソースのみ）
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', event.request.url);
            return cachedResponse;
          }

          // キャッシュにもない場合は、HTMLリクエストならindex.htmlを返す
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
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
