// PMS service worker: lets the app open with no connection to the server.
//  - Pages: always asked from the server first. If it cannot be reached, the copy saved on this device is shown
//    (saved by src/lib/offline/pages.ts while connected); with no copy, the offline screen.
//  - App files (/_next/static, icons): kept after first use; their names change with every build, so they never go stale.
//  - Everything else (data requests, form posts, /api/live, /api/sync) goes straight to the network.
// Bump a version below to throw away what phones have stored.
const SHELL = "pms-shell-v2"; // the offline screen
const STATIC = "pms-static-v1"; // scripts, styles, fonts, icons
const PAGES = "pms-pages-v1"; // the signed-in user's pages; must match PAGES in src/lib/offline/pages.ts
const OFFLINE_URL = "/offline.html";
const SHELL_FILES = [OFFLINE_URL, "/icons/icon-192.png"];
const WAIT_MS = 4000; // a server PC that is switched off can leave a request hanging; after this, show the saved copy

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = [SHELL, STATIC, PAGES];
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

const isAppPage = (url) => !url.pathname.startsWith("/api/") && !url.pathname.startsWith("/_next/") && url.pathname !== "/login" && url.pathname !== "/" && url.pathname !== OFFLINE_URL;
const isStatic = (url) => url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname === "/icon.svg" || url.pathname === "/apple-icon.png";

async function savedPage(request, url) {
  const pages = await caches.open(PAGES);
  return (await pages.match(request, { ignoreVary: true })) || (await pages.match(url.pathname, { ignoreVary: true, ignoreSearch: true })) || null;
}

async function page(request) {
  const url = new URL(request.url);
  const fromServer = fetch(request).then(async (res) => {
    if (res.ok && !res.redirected && isAppPage(url)) { const pages = await caches.open(PAGES); await pages.put(url.pathname + url.search, res.clone()); }
    return res;
  });
  const slow = new Promise((resolve) => setTimeout(() => resolve(null), WAIT_MS));
  try {
    const first = await Promise.race([fromServer, slow]);
    if (first) return first;
    return (await savedPage(request, url)) || (await fromServer); // slow server: saved copy if there is one, else keep waiting
  } catch {
    fromServer.catch(() => {});
    return (await savedPage(request, url)) || (await caches.match(OFFLINE_URL));
  }
}

async function appFile(request) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(request, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) await cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") { event.respondWith(page(request)); return; }
  if (SHELL_FILES.includes(url.pathname)) { event.respondWith(caches.match(request).then((hit) => hit || fetch(request))); return; }
  if (isStatic(url)) event.respondWith(appFile(request));
});
