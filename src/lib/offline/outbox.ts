// Browser-side outbox: daily logs and bird movements recorded with no connection wait here (IndexedDB) and are
// posted to /api/sync, oldest first, when the server is reachable again. Each entry belongs to the user who recorded it.
import { useEffect, useState } from "react";
import { setServerOnline } from "./connection";

export type OutboxKind = "dailyLog" | "movement";
export interface OutboxEntry {
  id: string; // also the server-side id of the created movement, which is what makes a re-send harmless
  kind: OutboxKind; userId: string; createdAt: number;
  data: Record<string, string>; // the form's fields, exactly as typed
  summary: [label: string, value: string][]; // readable copy for the list, captured in the user's language
  status: "waiting" | "refused"; error?: string;
}

const DB = "pms-offline", STORE = "outbox";
let currentUser: string | null = null; // set by <OfflineSync> in the app layout
export const setOutboxUser = (id: string | null) => { currentUser = id; };

const listeners = new Set<() => void>();
const changed = () => listeners.forEach((l) => l());

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("no IndexedDB")); return; }
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: "id" }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const req = run(t.objectStore(STORE));
      t.oncomplete = () => resolve(req.result);
      t.onerror = () => reject(t.error); t.onabort = () => reject(t.error);
    });
  } finally { db.close(); }
}

/** UUID v4. crypto.randomUUID only exists on https:// and localhost; getRandomValues works everywhere. */
export function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10).join("")}`;
}

/** Keep an entry on this device. Rejects when there is no signed-in user or the browser has no storage. */
export async function addEntry(kind: OutboxKind, data: Record<string, string>, summary: [string, string][]): Promise<void> {
  if (!currentUser) throw new Error("no user");
  const entry: OutboxEntry = { id: newId(), kind, userId: currentUser, createdAt: Date.now(), data, summary, status: "waiting" };
  await tx("readwrite", (s) => s.add(entry));
  changed();
}
export async function listEntries(userId: string): Promise<OutboxEntry[]> {
  const all = await tx<OutboxEntry[]>("readonly", (s) => s.getAll());
  return all.filter((e) => e.userId === userId).sort((a, b) => a.createdAt - b.createdAt);
}
export async function removeEntry(id: string) { await tx("readwrite", (s) => s.delete(id)); changed(); }
export async function retryEntry(entry: OutboxEntry) { await tx("readwrite", (s) => s.put({ ...entry, status: "waiting", error: undefined })); changed(); }

let sending = false;
/**
 * Send this user's waiting entries, oldest first. Stops at the first one that cannot reach the server, so order is kept.
 * Returns how many were saved and whether the server asked for a new login.
 */
export async function sendWaiting(userId: string): Promise<{ sent: number; loginNeeded: boolean }> {
  if (sending) return { sent: 0, loginNeeded: false };
  sending = true;
  let sent = 0, loginNeeded = false;
  try {
    for (const entry of (await listEntries(userId)).filter((e) => e.status === "waiting")) {
      let res: Response;
      try { res = await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: entry.id, kind: entry.kind, data: entry.data }) }); }
      catch { setServerOnline(false); break; }
      if (res.ok) { await tx("readwrite", (s) => s.delete(entry.id)); sent++; }
      else if (res.status === 401) { loginNeeded = true; break; }
      else if (res.status === 422 || res.status === 403) {
        const message = await res.json().then((j: { error?: string }) => j.error, () => undefined);
        await tx("readwrite", (s) => s.put({ ...entry, status: "refused", error: message ?? String(res.status) }));
      } else break; // server trouble: leave it waiting and try again later
      changed();
    }
  } catch { /* storage unavailable: nothing to send */ }
  finally { sending = false; }
  return { sent, loginNeeded };
}

/** This user's entries, kept current as they are added, sent or discarded. */
export function useOutbox(userId: string): OutboxEntry[] {
  const [entries, setEntries] = useState<OutboxEntry[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () => { listEntries(userId).then((e) => { if (alive) setEntries(e); }, () => {}); };
    load(); listeners.add(load);
    return () => { alive = false; listeners.delete(load); };
  }, [userId]);
  return entries;
}
