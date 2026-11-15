"use client";
import { startTransition, useActionState, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions";
import { CloudUpload, Loader2 } from "lucide-react";
import { checkServer, isServerOnline, pingServer, setServerOnline } from "@/lib/offline/connection";
import { addEntry, type OutboxKind } from "@/lib/offline/outbox";
import { useT } from "@/components/I18nProvider";

type Props = {
  trigger?: ReactNode;                // any element; wrapped with DialogTrigger. Omit when controlled via open/onOpenChange.
  open?: boolean; onOpenChange?: (o: boolean) => void;
  title: string; description?: string;
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  submitLabel?: string; children: ReactNode; wide?: boolean;
  /** Set on forms that may be recorded with no connection: the entry waits on the device and is sent later. */
  offline?: OutboxKind;
};
type FormState = ActionState | { queued: true; ok?: undefined; error?: undefined };

/** Readable "label: value" pairs of what was typed, for the waiting-to-send list. */
function summarize(form: HTMLFormElement): [string, string][] {
  const out: [string, string][] = [];
  for (const el of form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input[name], select[name], textarea[name]")) {
    if (el.type === "hidden") continue;
    const value = el instanceof HTMLSelectElement ? (el.selectedOptions[0]?.value ? el.selectedOptions[0].text : "") : el.value.trim();
    if (!value || (el.type === "number" && Number(value) === 0)) continue;
    const label = el.closest(".grid")?.querySelector(":scope > label")?.textContent?.trim();
    if (label) out.push([label, value]);
  }
  return out;
}

/** Modal form bound to a server action. Closes and refreshes data on success; shows errors inline
 *  while keeping the user's input (we invoke the action manually so React doesn't reset the form).
 *  With no connection to the server, an `offline` form keeps the entry on the device; any other form says it needs a connection. */
export function FormDialog({ trigger, open: openProp, onOpenChange, title, description, action, submitLabel, children, wide, offline }: Props) {
  const { t } = useT();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const [queued, setQueued] = useState(false);
  const setOpen = useCallback((o: boolean) => { if (o) setQueued(false); setOpenState(o); onOpenChange?.(o); }, [onOpenChange]);
  const router = useRouter();
  const summary = useRef<[string, string][]>([]);
  const submit = useCallback(async (prev: FormState, fd: FormData): Promise<FormState> => {
    const keepOnDevice = async (): Promise<FormState> => {
      if (!offline) return { error: t("offline.cannot") };
      try { await addEntry(offline, Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)])), summary.current); return { queued: true }; }
      catch { return { error: t("offline.cannot") }; }
    };
    if (!isServerOnline() && !(await checkServer())) return keepOnDevice();
    try { return await action(prev as ActionState, fd); }
    catch (e) {
      if (await pingServer()) throw e; // the server is there, so this is a real failure
      setServerOnline(false);
      return keepOnDevice();
    }
  }, [action, offline, t]);
  const [state, formAction, pending] = useActionState(submit, undefined);
  useEffect(() => {
    if (state?.ok) { setOpen(false); router.refresh(); }
    else if (state && "queued" in state) setQueued(true);
  }, [state, router, setOpen]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={<span className="contents" />} nativeButton={false}>{trigger}</DialogTrigger>}
      <DialogContent className={wide ? "sm:max-w-2xl" : "sm:max-w-lg"}>
        {queued ? (
          <div className="space-y-5">
            <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
            <div role="status" className="flex items-start gap-3 rounded-lg border border-success/30 bg-success-soft px-3 py-3 text-sm"><CloudUpload className="mt-0.5 size-4 shrink-0 text-success" /><span>{t("offline.queued")}</span></div>
            <DialogFooter><DialogClose render={<Button type="button" />}>{t("common.close")}</DialogClose></DialogFooter>
          </div>
        ) : (
        <form onSubmit={(e) => { e.preventDefault(); summary.current = summarize(e.currentTarget); const fd = new FormData(e.currentTarget); startTransition(() => formAction(fd)); }} className="space-y-5">
          <DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader>
          {state?.error && !state.ok && <div className="rounded-lg border border-destructive/30 bg-danger-soft px-3 py-2 text-sm text-destructive">{state.error}</div>}
          <div className="space-y-4">{children}</div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>{t("common.cancel")}</DialogClose>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />}{submitLabel ?? t("common.save")}</Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
