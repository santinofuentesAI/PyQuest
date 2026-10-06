/* Cache Pyodide so Vercel visits after the first one skip the CDN. */
const VERSION = "0.27.5";
const CACHE = `pyquest-pyodide-${VERSION}`;

function isPyodideRequest(url) {
  try {
    const u = new URL(url);
    if (u.pathname.endsWith("/pyodide-worker.js")) return true;
    if (u.hostname.includes("jsdelivr.net") && u.pathname.includes("pyodide")) return true;
    if (u.pathname.includes("/pyodide/")) return true;
    return false;
  } catch {
    return false;
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("pyquest-pyodide-") && key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!isPyodideRequest(event.request.url)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(event.request, { ignoreSearch: true });
      if (hit) return hit;
      const res = await fetch(event.request);
      if (res.ok) cache.put(event.request, res.clone());
      return res;
    })(),
  );
});
