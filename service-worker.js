const CACHE_NAME = "taiprompts-offline-v2";
const OFFLINE_URL = new URL("./offline.html", self.registration.scope);

// The offline document is the only cached resource; the site itself stays network-only.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL.href))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith("taiprompts-offline-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cachedOfflinePage = await caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL.href));
      return cachedOfflinePage || Response.error();
    })
  );
});
