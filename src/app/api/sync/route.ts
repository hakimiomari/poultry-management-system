// Receives one entry recorded on a phone while it had no connection (see src/lib/offline/outbox.ts).
// Runs exactly the same rules as the online forms. Replies: 200 saved · 422 refused (message says why) ·
// 401 log in again · 403 role not allowed. Anything else means "try again later".
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { can } from "@/lib/enums";
import { getT } from "@/lib/locale";
import { applyDailyLog, applyMovement } from "@/lib/records";
export const dynamic = "force-dynamic";

const body = z.object({ id: z.string().uuid(), kind: z.enum(["dailyLog", "movement"]), data: z.record(z.string(), z.unknown()) });

export async function POST(req: Request) {
  const user = await getSession();
  const account = user && (await prisma.user.findUnique({ where: { id: user.id }, select: { isActive: true } }));
  if (!user || !account?.isActive) return Response.json({ error: "login" }, { status: 401 });
  const { t } = await getT();
  if (!can(user.role, "records")) return Response.json({ error: t("err.noPermission") }, { status: 403 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: t("err.invalid", { fields: "—" }) }, { status: 422 });
  const { id, kind, data } = parsed.data;
  const input = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v === "" ? undefined : v])); // same as formToObject
  const result = kind === "dailyLog" ? await applyDailyLog(user, t, input, id) : await applyMovement(user, t, input, id);
  return result?.ok ? Response.json({ ok: true }) : Response.json({ error: result?.error ?? t("err.notFound") }, { status: 422 });
}
