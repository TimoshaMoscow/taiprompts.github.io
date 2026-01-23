// Минимальный service worker без кеширования
self.addEventListener('install', event => {
  // сразу активируем новый SW
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // сразу начинаем управлять открытыми вкладками
  clients.claim();
});

// Не перехватываем запросы, просто даём браузеру работать как обычно
self.addEventListener('fetch', event => {
  // можно оставить пустым или просто логировать, если хочешь
  // console.log('[SW] fetch', event.request.url);
});
