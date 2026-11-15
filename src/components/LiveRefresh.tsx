"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps every open screen current: listens to /api/live and re-fetches the page's data when anyone saves a change.
 * router.refresh() re-renders server data in place, so open dialogs and typed input are kept.
 */
export function LiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let source: EventSource | null = null;
    let stale = false; // a change arrived while this tab was hidden
    let opened = false;

    const refresh = () => {
      if (document.hidden) {
        stale = true;
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 250);
    };
    const connect = () => {
      source = new EventSource("/api/live");
      source.addEventListener("change", refresh);
      // A re-open means the connection dropped (phone slept, Wi-Fi blip): changes may have been missed, so catch up.
      source.onopen = () => {
        if (opened) refresh();
        opened = true;
      };
    };
    const onVisible = () => {
      if (document.hidden) return;
      if (source?.readyState === EventSource.CLOSED) {
        source.close();
        connect();
      }
      if (stale) {
        stale = false;
        refresh();
      }
    };

    connect();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearTimeout(timer);
      source?.close();
    };
  }, [router]);
  return null;
}
