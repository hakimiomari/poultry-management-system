"use client";
import { useEffect, useSyncExternalStore } from "react";

/** Chrome's install event; not in the DOM typings. */
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

// The browser fires the install event once, early, so it is kept here for whichever component offers the button.
let pending: InstallEvent | null = null;
const listeners = new Set<() => void>();
const changed = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** Mounted once in the root layout: registers the service worker and remembers the browser's install offer. */
export function PwaRegister() {
  useEffect(() => {
    // Service workers exist only on https:// or localhost. Production only, so `npm run dev` is never served stale files.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const onOffer = (e: Event) => { pending = e as InstallEvent; changed(); };
    const onInstalled = () => { pending = null; changed(); };
    window.addEventListener("beforeinstallprompt", onOffer);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onOffer); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  return null;
}

/** `available` is true only while the browser is offering to install PMS; `install()` opens the browser's own dialog. */
export function useInstallPrompt() {
  const available = useSyncExternalStore(subscribe, () => pending !== null, () => false);
  const install = async () => {
    const offer = pending;
    if (!offer) return;
    await offer.prompt();
    await offer.userChoice;
    pending = null; changed(); // an offer can be used once
  };
  return { available, install };
}
