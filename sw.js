const CACHE_NAME = 'pikat4d-cache-v1';

// Daftar semua aset yang akan disimpan di memori HP member
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/carousel-1.webp',
  '/icons/donwload.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        URLS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('Gagal cache:', url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  // Memastikan hanya aset lokal kita yang di-cache
  const isLocalAsset = url.includes('/assets/') || url.endsWith('/') || url.includes('index.html') || url.includes('manifest.json');

  if (isLocalAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        });
      })
    );
  }
});
