// Browser-side: keeps a copy of the user's pages on the device so they open with no connection.
// The copies are served by the service worker (public/sw.js), which only runs on https:// or localhost.
import { pingServer } from "./connection";

const PAGES = "pms-pages-v1"; // must match PAGES in public/sw.js
const OWNER = "/__offline-owner"; // whose pages these are; a different user signing in wipes them

const supported = () => typeof caches !== "undefined" && typeof navigator !== "undefined" && !!navigator.serviceWorker?.controller;

/** Remove every saved page from this device (logout, or another user signing in). */
export async function clearOfflinePages(): Promise<void> {
  if (typeof caches === "undefined") return;
  try { await caches.delete(PAGES); } catch { /* nothing saved */ }
}

/** Sign out and leave no saved pages behind. With no connection the session cannot be ended, so nothing is thrown. */
export async function signOut(logout: () => Promise<void>): Promise<void> {
  await clearOfflinePages();
  try { await logout(); } catch (e) { if (await pingServer()) throw e; }
}

// A saved page is useless without its scripts, styles and fonts, and those for a page the user has not opened yet were
// never downloaded. Requesting them is enough: the service worker keeps every /_next/static file it sees.
const fetched = new Set<string>();
const NEXT_FILE = /(?:\/_next\/)?static\/(?:chunks|css|media)\/[^"'\\\s<>]+|\/_next\/static\/[^"'\\\s<>]+/g;
const WHOLE_FILE = /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|svg|webp|json)$/;
async function saveFilesOf(html: string): Promise<void> {
  // Next streams its page data in pieces, which can cut a file name in two: join the pieces, then keep only whole file names.
  const joined = html.replaceAll('"])</script><script>self.__next_f.push([1,"', "");
  const files = new Set([...joined.matchAll(NEXT_FILE)].map((m) => (m[0].startsWith("/_next/") ? m[0] : `/_next/${m[0]}`)).filter((f) => WHOLE_FILE.test(f)));
  await Promise.all([...files].filter((f) => !fetched.has(f)).map(async (file) => {
    try {
      const res = await fetch(file);
      if (!res.ok) return;
      fetched.add(file);
      // fonts are named inside the stylesheets, not in the page
      if (file.endsWith(".css")) await Promise.all([...(await res.text()).matchAll(/\/_next\/static\/media\/[^)"'\s]+/g)].map((m) => fetch(m[0]).catch(() => undefined)));
    } catch { /* offline again: try on the next save */ }
  }));
}

/** Fetch each page and store it, together with the files it needs. Pages the user may not open (redirects) and failures are skipped. Returns how many were saved. */
export async function saveOfflinePages(userId: string, urls: string[]): Promise<number> {
  if (!supported()) return 0;
  let saved = 0;
  try {
    let cache = await caches.open(PAGES);
    const owner = await cache.match(OWNER).then((r) => r?.text());
    if (owner !== userId) { await caches.delete(PAGES); cache = await caches.open(PAGES); await cache.put(OWNER, new Response(userId)); }
    for (const url of urls) {
      try {
        const res = await fetch(url, { credentials: "same-origin", cache: "no-store" });
        if (res.ok && !res.redirected && (res.headers.get("content-type") ?? "").includes("text/html")) {
          await saveFilesOf(await res.clone().text());
          await cache.put(url, res); saved++;
        }
      } catch { break; } // lost the connection part-way: keep what is already saved
    }
  } catch { /* storage unavailable */ }
  return saved;
}
