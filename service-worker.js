const CACHE_NAME = 'taiprompts-cache-v2';
const OFFLINE_URL = '/offline.html';

// Ресурсы, которые кешируем при установке
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/generator.html',
  '/faq.html',
  '/offline.html',
  '/manifest.json',
  '/main.js',
  '/styles/main.css',
  '/styles/index.css',
  '/styles/generator.css',
  '/styles/faq.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Устанавливаем SW и кешируем статику
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активируем и очищаем старые кеши
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

// Стратегия: stale-while-revalidate + offline fallback
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Игнорируем запросы к analytics и API
  if (url.pathname.includes('/api/') || url.pathname.includes('gtm')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Если есть в кеше — отдаём и обновляем в фоне
        if (cachedResponse) {
          // Фоновое обновление (stale-while-revalidate)
          event.waitUntil(
            fetch(request)
              .then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                  if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone());
                  }
                });
              })
              .catch(() => {}) // Если сеть упала — просто игнорируем
          );
          return cachedResponse;
        }

        // Если нет в кеше — пытаемся сходить в сеть
        return fetch(request)
          .then(networkResponse => {
            // Кешируем успешные ответы
            if (networkResponse.ok && request.method === 'GET') {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Если сеть недоступна и это навигация — отдаём оффлайн-страницу
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            // Для остальных запросов — возвращаем fallback или ошибку
            return new Response('Вы оффлайн', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});