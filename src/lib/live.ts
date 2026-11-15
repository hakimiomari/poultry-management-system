// Live updates: one in-process signal that says "data changed". Every write is audited, so audit() raises it;
// /api/live streams it to each open screen, which re-fetches its own data. No row data travels on this channel.
import { EventEmitter } from "node:events";

// Kept on globalThis so server actions and the /api/live route share one emitter even when bundled separately.
const g = globalThis as unknown as { __pmsLive?: EventEmitter; __pmsLiveTimer?: ReturnType<typeof setTimeout> };
const bus = (g.__pmsLive ??= new EventEmitter());
bus.setMaxListeners(0); // one listener per connected screen

/** Announce a change. Bursts collapse into one signal, sent shortly after so an action's remaining writes have landed. */
export function notifyChange() {
  if (g.__pmsLiveTimer) return;
  g.__pmsLiveTimer = setTimeout(() => { g.__pmsLiveTimer = undefined; bus.emit("change"); }, 150);
}

/** Subscribe; returns the unsubscribe function. */
export function onChange(listener: () => void): () => void {
  bus.on("change", listener);
  return () => { bus.off("change", listener); };
}
