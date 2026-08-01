const CACHE_NAME = "safarai-v1";
const OFFLINE_URL = "/app/trips";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(["/", OFFLINE_URL, "/favicon.png", "/icons/icon-192.png"]),
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
