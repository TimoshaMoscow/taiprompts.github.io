const CACHE_NAME = 'taiprompts-offline-v1';
const OFFLINE_URL = '/offline.html';

// Кешируем ТОЛЬКО оффлайн-страницу и критические ресурсы для неё
const OFFLINE_ASSETS = [
  '/offline.html'
  // Никаких index.html, styles, js — только оффлайн-заглушка
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(OFFLINE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Если это запрос к оффлайн-странице — отдаём из кеша
  if (url.pathname === OFFLINE_URL) {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
    );
    return;
  }

  // Для всех остальных запросов — ТОЛЬКО сеть
  event.respondWith(
    fetch(request)
      .then(response => {
        // Если запрос успешен — просто возвращаем ответ
        return response;
      })
      .catch(() => {
        // Если сеть упала — проверяем, навигация ли это
        if (request.mode === 'navigate') {
          // Отдаём оффлайн-страницу из кеша
          return caches.match(OFFLINE_URL);
        }
        // Для ресурсов (css, js, картинки) — возвращаем минимальный fallback
        return new Response('', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});