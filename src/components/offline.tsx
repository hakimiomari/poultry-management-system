"use client";
// Offline field entry, screen side. See src/lib/offline/* (storage) and public/sw.js (saved pages).
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudOff, CloudUpload, RotateCw, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ToneBadge } from "@/components/pms";
import { useT } from "@/components/I18nProvider";
import { checkServer, isServerOnline, onServerOnlineChange, useServerOnline } from "@/lib/offline/connection";
import { removeEntry, retryEntry, sendWaiting, setOutboxUser, useOutbox } from "@/lib/offline/outbox";
import { saveOfflinePages } from "@/lib/offline/pages";

/** Local date and time, digits left-to-right in every language. */
const stamp = (ms: number) => { const d = new Date(ms), p = (n: number) => String(n).padStart(2, "0"); return `⁦${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}⁩`; };

// Shared between <OfflineSync> (which sends) and <OutboxButton> (which shows it).
let loginNeeded = false;
const loginListeners = new Set<() => void>();
const setLoginNeeded = (v: boolean) => { if (v !== loginNeeded) { loginNeeded = v; loginListeners.forEach((l) => l()); } };

async function send(userId: string, router: ReturnType<typeof useRouter>) {
  const r = await sendWaiting(userId);
  setLoginNeeded(r.loginNeeded);
  if (r.sent > 0) router.refresh(); // show what was just saved
}

/**
 * Mounted once in the app layout. Watches whether the server is reachable, sends waiting entries when it is,
 * and keeps the user's pages saved on the device for when it is not.
 */
export function OfflineSync({ userId, pages }: { userId: string; pages: string[] }) {
  const router = useRouter();
  const pagesRef = useRef(pages);
  useEffect(() => { pagesRef.current = pages; }, [pages]);

  useEffect(() => {
    setOutboxUser(userId);
    let lastSaved = 0, saveTimer: ReturnType<typeof setTimeout> | undefined;
    // Saving re-fetches every page, so it is spaced out: soon after opening, then at most once a minute after changes.
    const savePages = (delay: number) => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        if (document.hidden || !isServerOnline()) return;
        lastSaved = Date.now();
        await saveOfflinePages(userId, pagesRef.current);
      }, Math.max(delay, 60_000 - (Date.now() - lastSaved)));
    };
    const beat = async () => { if (!document.hidden && (await checkServer())) await send(userId, router); };
    const onChange = () => savePages(20_000);
    const onVisible = () => { if (!document.hidden) { beat(); savePages(5_000); } };
    const onOnline = () => { if (isServerOnline()) { send(userId, router); savePages(5_000); } };

    beat(); savePages(3_000);
    const timer = setInterval(beat, 10_000);
    const offOnline = onServerOnlineChange(onOnline);
    window.addEventListener("online", beat); window.addEventListener("offline", beat);
    window.addEventListener("pms:data-changed", onChange);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer); clearTimeout(saveTimer); offOnline();
      window.removeEventListener("online", beat); window.removeEventListener("offline", beat);
      window.removeEventListener("pms:data-changed", onChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, router]);
  return null;
}

/** Strip under the header while the server is unreachable. `renderedAt` is when this page was produced, i.e. how old the data is. */
export function OfflineBanner({ renderedAt }: { renderedAt: number }) {
  const { t } = useT();
  const online = useServerOnline();
  if (online) return null;
  return (
    <div role="status" className="flex items-start gap-3 border-b border-warning/40 bg-warning-soft px-4 py-2.5 text-sm lg:px-6">
      <CloudOff className="mt-0.5 size-4 shrink-0 text-warning" />
      <div><span className="font-semibold">{t("offline.banner", { time: stamp(renderedAt) })}</span> <span className="text-muted-foreground">{t("offline.bannerHint")}</span></div>
    </div>
  );
}

/** Header button: appears while offline or while entries are waiting; opens the list of entries kept on this device. */
export function OutboxButton({ userId }: { userId: string }) {
  const { t } = useT();
  const router = useRouter();
  const online = useServerOnline();
  const entries = useOutbox(userId);
  const [open, setOpen] = useState(false);
  const [needLogin, setNeedLogin] = useState(loginNeeded);
  useEffect(() => { const l = () => setNeedLogin(loginNeeded); loginListeners.add(l); return () => { loginListeners.delete(l); }; }, []);
  const refused = entries.filter((e) => e.status === "refused").length;
  if (online && entries.length === 0) return null;
  const kindLabel = (k: string) => (k === "dailyLog" ? t("logs.form.title") : t("mov.form.title"));
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={t("outbox.title")}
        className="flex h-10 items-center gap-1.5 rounded-full border border-transparent px-2.5 text-sm font-medium outline-none transition hover:border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50">
        {online ? <CloudUpload className="size-4.5 text-muted-foreground" /> : <CloudOff className="size-4.5 text-warning" />}
        {!online && <span className="hidden sm:block">{t("offline.label")}</span>}
        {entries.length > 0 && <span className={`tabular flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${refused ? "bg-destructive text-white" : "bg-primary text-primary-foreground"}`}>{entries.length}</span>}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("outbox.title")}</DialogTitle><DialogDescription>{t("outbox.desc")}</DialogDescription></DialogHeader>
          {!online && <div className="rounded-lg border border-warning/40 bg-warning-soft px-3 py-2 text-sm">{t("offline.cannot")}</div>}
          {online && needLogin && <div className="rounded-lg border border-destructive/30 bg-danger-soft px-3 py-2 text-sm text-destructive">{t("outbox.loginNeeded")}</div>}
          {entries.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{t("outbox.empty")}</p>}
          <ul className="max-h-[55vh] space-y-2 overflow-y-auto">
            {entries.map((e) => (
              <li key={e.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{kindLabel(e.kind)}</span>
                  <ToneBadge tone={e.status === "refused" ? "red" : "amber"}>{e.status === "refused" ? t("outbox.refused") : t("outbox.waiting")}</ToneBadge>
                </div>
                <div className="mt-1 text-muted-foreground">{e.summary.map(([label, value]) => `${label}: ${value}`).join(" · ")}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t("outbox.recordedAt", { time: stamp(e.createdAt) })}</div>
                {e.status === "refused" && <div className="mt-2 rounded-md bg-danger-soft px-2.5 py-1.5 text-destructive"><div className="font-medium">{e.error}</div><div className="text-xs">{t("outbox.refusedHint")}</div></div>}
                <div className="mt-2 flex justify-end gap-2">
                  {e.status === "refused" && <Button size="sm" variant="outline" disabled={!online} onClick={async () => { await retryEntry(e); await send(userId, router); }}><RotateCw />{t("outbox.retry")}</Button>}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeEntry(e.id)}><Trash2 />{t("outbox.discard")}</Button>
                </div>
              </li>
            ))}
          </ul>
          {entries.some((e) => e.status === "waiting") && <Button disabled={!online} onClick={() => send(userId, router)}><CloudUpload />{t("outbox.sendNow")}</Button>}
        </DialogContent>
      </Dialog>
    </>
  );
}
