"use client";
import { startTransition, useActionState, useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import { useT } from "@/components/I18nProvider";

type Props = {
  trigger?: ReactNode;                // any element; wrapped with DialogTrigger. Omit when controlled via open/onOpenChange.
  open?: boolean; onOpenChange?: (o: boolean) => void;
  title: string; description?: string;
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  submitLabel?: string; children: ReactNode; wide?: boolean;
};

/** Modal form bound to a server action. Closes and refreshes data on success; shows errors inline
 *  while keeping the user's input (we invoke the action manually so React doesn't reset the form). */
export function FormDialog({ trigger, open: openProp, onOpenChange, title, description, action, submitLabel, children, wide }: Props) {
  const { t } = useT();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = useCallback((o: boolean) => { setOpenState(o); onOpenChange?.(o); }, [onOpenChange]);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, undefined);
  useEffect(() => { if (state?.ok) { setOpen(false); router.refresh(); } }, [state, router, setOpen]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={<span className="contents" />} nativeButton={false}>{trigger}</DialogTrigger>}
      <DialogContent className={wide ? "sm:max-w-2xl" : "sm:max-w-lg"}>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => formAction(fd)); }} className="space-y-5">
          <DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader>
          {state?.error && !state.ok && <div className="rounded-lg border border-destructive/30 bg-danger-soft px-3 py-2 text-sm text-destructive">{state.error}</div>}
          <div className="space-y-4">{children}</div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>{t("common.cancel")}</DialogClose>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />}{submitLabel ?? t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
