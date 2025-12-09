const CACHE_NAME = 'taiprompts-v1.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
  // Добавьте другие важные файлы вашего сайта
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Service Worker: Caching files");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing old cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  console.log("Service Worker: Fetching", event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кешированную версию, если есть
        if (response) {
          return response;
        }
        
        // Иначе загружаем из сети
        return fetch(event.request)
          .then(response => {
            // Не кешируем ошибки или не-GET запросы
            if (!response || response.status !== 200 || 
                response.type !== 'basic' || 
                event.request.method !== 'GET') {
              return response;
            }
            
            // Клонируем ответ для кеширования
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Офлайн-страница или fallback
            return caches.match('/offline.html') 
                   || new Response('Офлайн режим');
          });
      })
  );
});
