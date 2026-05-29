const ROUTEPILOT_CACHE = "routepilot-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./privacy.html",
  "./terms.html",
  "./route-optimizer.css",
  "./route-optimizer.js",
  "./manifest.webmanifest",
  "./assets/routepilot-cover.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(ROUTEPILOT_CACHE)
      .then((cache) => Promise.allSettled(CORE_ASSETS.map((asset) => cache.add(asset))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== ROUTEPILOT_CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(ROUTEPILOT_CACHE).then((cache) => {
          cache.put(event.request, copy);
        });
        return response;
      });
    })
  );
});
