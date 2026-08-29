"use client";
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions";
import { useT } from "@/components/I18nProvider";

/** Destructive action behind a confirmation dialog. */
export function ConfirmButton({ trigger, title, description, action, confirmLabel }: { trigger: ReactNode; title: string; description: string; action: () => Promise<ActionState | void>; confirmLabel?: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(false); const [error, setError] = useState<string>();
  const [pending, start] = useTransition(); const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span className="contents" />} nativeButton={false}>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        {error && <div className="rounded-lg border border-destructive/30 bg-danger-soft px-3 py-2 text-sm text-destructive">{error}</div>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{t("common.cancel")}</DialogClose>
          <Button variant="destructive" disabled={pending} onClick={() => start(async () => { const r = await action(); if (r && "error" in r && r.error) setError(r.error); else { setOpen(false); router.refresh(); } })}>{confirmLabel ?? t("common.delete")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
