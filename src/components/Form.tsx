"use client";
import { useActionState } from "react";
import type { ReactNode } from "react";
import type { ActionState } from "@/lib/actions";

export function ActionForm({ action, children, submitLabel = "Save" }: { action: (s: ActionState, fd: FormData) => Promise<ActionState>; children: ReactNode; submitLabel?: string }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="card space-y-5 p-6">
      {state?.error && <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">{state.error}</div>}
      {children}
      <button disabled={pending} className="w-full rounded-xl bg-primary px-4 py-3.5 text-base font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50 sm:w-auto sm:min-w-40">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
