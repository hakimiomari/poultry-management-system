import { prisma } from "@/lib/db";
export async function GET() { const flocks = await prisma.flock.count(); return Response.json({ ok: true, flocks }); }
