import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Field = ({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) => (
  <div className={cn("grid gap-1.5", className)}><Label>{label}</Label>{children}{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>
);
/** Large numeric input for field data entry (SPEC Part D.4). */
export const BigNumber = (props: React.ComponentProps<typeof Input>) => (
  <Input type="number" inputMode="numeric" {...props} className={cn("tabular h-14 text-center text-2xl font-semibold md:text-2xl", props.className)} />
);
