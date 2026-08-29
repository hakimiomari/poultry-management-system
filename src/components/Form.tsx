"use client";
import { useActionState } from "react";
import type { ReactNode } from "react";
import type { ActionState } from "@/lib/actions";

/** Generic form wrapper for server actions with error display + pending state. */
export function ActionForm({ action, children, submitLabel = "Save" }: { action: (s: ActionState, fd: FormData) => Promise<ActionState>; children: ReactNode; submitLabel?: string }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</div>}
      {children}
      <button disabled={pending} className="w-full rounded-lg bg-green-700 px-4 py-3 text-base font-medium text-white hover:bg-green-800 disabled:opacity-50 sm:w-auto">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
