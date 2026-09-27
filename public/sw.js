const CACHE_NAME = "safarai-v2";
const OFFLINE_URL = "/app/trips";
const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/manifest.json",
  "/favicon.ico",
  "/assets/pwa-icons/browser-tab-96x96.png",
  "/assets/pwa-icons/pwa-android-192x192.png",
  "/assets/pwa-icons/apple-homescreen-180x180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Every entry is cached independently so a single failing request (an
      // offline first run, for example) cannot abort the whole installation.
      Promise.all(
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => undefined)),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("next-auth")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() =>
      caches
        .match(event.request)
        .then((response) => response || caches.match(OFFLINE_URL)),
    ),
  );
});
