// Browser-side: can this device reach the PMS server right now?
// navigator.onLine is not enough (a phone can be on Wi-Fi while the server PC is off), so the server is pinged.
import { useSyncExternalStore } from "react";

let online = true; // pages are rendered by the server, so assume reachable until a ping says otherwise
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const isServerOnline = () => online;
export function setServerOnline(value: boolean) { if (value !== online) { online = value; listeners.forEach((l) => l()); } }
export const onServerOnlineChange = subscribe;

/** One quick request to /api/ping. Never throws. */
export async function pingServer(timeoutMs = 4000): Promise<boolean> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  try { return (await fetch("/api/ping", { cache: "no-store", signal: abort.signal })).ok; }
  catch { return false; }
  finally { clearTimeout(timer); }
}
/** Ping and record the result. */
export async function checkServer(): Promise<boolean> { const ok = await pingServer(); setServerOnline(ok); return ok; }

export function useServerOnline(): boolean { return useSyncExternalStore(subscribe, isServerOnline, () => true); }
