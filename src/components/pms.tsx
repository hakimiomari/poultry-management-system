import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Siren } from "lucide-react";

export const Kpi = ({ label, value, sub, icon, tone = "default" }: { label: string; value: string | number; sub?: string; icon?: ReactNode; tone?: "default" | "danger" | "ok" | "info" }) => {
  const color = { default: "text-foreground", danger: "text-destructive", ok: "text-success", info: "text-info" }[tone];
  const bg = { default: "bg-muted text-muted-foreground", danger: "bg-danger-soft text-destructive", ok: "bg-success-soft text-success", info: "bg-info-soft text-info" }[tone];
  return (
    <Card size="sm"><CardContent className="flex items-start gap-3">
      {icon && <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg [&>svg]:size-5", bg)}>{icon}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-muted-foreground">{label}</div>
        <div className={cn("tabular mt-0.5 whitespace-nowrap text-xl font-semibold leading-tight md:text-2xl", color)}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </CardContent></Card>
  );
};

type Tone = "gray" | "green" | "red" | "amber" | "blue";
export const ToneBadge = ({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) => (
  <Badge variant="secondary" className={cn({ gray: "", green: "bg-success-soft text-success", red: "bg-danger-soft text-destructive", amber: "bg-warning-soft text-warning", blue: "bg-info-soft text-info" }[tone])}>{children}</Badge>
);
export const typeTone = (t: string): Tone => (t === "BROILER" ? "amber" : "blue");
export const movementTone = (t: string): Tone => (t === "MORTALITY" ? "red" : t === "SALE" ? "green" : "gray");
export const statusTone = (s: string): Tone => (s === "ACTIVE" || s === "OCCUPIED" ? "green" : s === "EMPTY" || s === "COMPLETED" ? "gray" : "amber");

export const PageHeader = ({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
);

export const AlertBanner = ({ severity, severityLabel, message, action }: { severity: string; severityLabel?: string; message: string; action: string }) => {
  const hot = severity === "CRITICAL" || severity === "HIGH";
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm", hot ? "border-destructive/30 bg-danger-soft" : "border-warning/40 bg-warning-soft")}>
      {hot ? <Siren className="mt-0.5 size-4 shrink-0 text-destructive" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />}
      <div className="flex-1"><span className="font-semibold">{message}</span><span className="text-muted-foreground"> — {action}</span></div>
      <ToneBadge tone={hot ? "red" : "amber"}>{severityLabel ?? severity}</ToneBadge>
    </div>
  );
};

export const Empty = ({ children }: { children: ReactNode }) => <div className="py-10 text-center text-sm text-muted-foreground">{children}</div>;
