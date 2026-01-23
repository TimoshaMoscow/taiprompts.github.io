// service-worker.js
const CACHE_NAME = 'taiprompts-v1.3';
const OFFLINE_URL = '/offline.html';

// Критические ресурсы для кэширования при установке
const CORE_ASSETS = [
  './',
  '/',
  '/index.html',
  '/generator.html',
  '/main.js',
  '/main.css',
  '/components/header.html',
  '/components/footer.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Установка');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Кэширование основных файлов');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
  console.log('[SW] Активация');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Удаляем старый кэш:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Готов к работе');
      return self.clients.claim();
    })
  );
});

// Стратегия кэширования: Network First, затем Cache
self.addEventListener('fetch', event => {
  // Пропускаем запросы, которые не являются GET
  if (event.request.method !== 'GET') return;
  
  // Для API и динамического контента - всегда сеть
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('.json')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Клонируем ответ для кэширования
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseClone);
          });
        
        return response;
      })
      .catch(() => {
        // Если оффлайн - ищем в кэше
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // Если страница HTML и нет в кэше - показываем оффлайн страницу
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            
            // Для других типов файлов возвращаем дефолтную иконку
            if (event.request.url.includes('.png') || 
                event.request.url.includes('.jpg') ||
                event.request.url.includes('.svg')) {
              return caches.match('./icons/icon-192.png');
            }
          });
      })
  );
});

// Обработчик сообщений от клиента
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
