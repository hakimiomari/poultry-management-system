import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { can, type Role } from "./enums";
import { redirect } from "next/navigation";

const COOKIE = "pms_session";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-secret");

export interface SessionUser { id: string; fullName: string; role: Role; language: string }

export async function login(phone: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.isActive) return null;
  if (!(await bcrypt.compare(password, user.passwordHash))) return null;
  const su: SessionUser = { id: user.id, fullName: user.fullName, role: user.role as Role, language: user.language };
  const token = await new SignJWT({ ...su }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 86400 });
  return su;
}

/** Re-issue the session cookie from the DB row (after profile edits). */
export async function refreshSession(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const su: SessionUser = { id: user.id, fullName: user.fullName, role: user.role as Role, language: user.language };
  const token = await new SignJWT({ ...su }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 86400 });
}

export async function logout() { (await cookies()).delete(COOKIE); }

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret()); return payload as unknown as SessionUser; } catch { return null; }
}

/** Server-side guard: redirects to /login when signed out, or to /dashboard when the role lacks the permission. */
export async function requireUser(permission?: string): Promise<SessionUser> {
  const u = await getSession();
  if (!u) redirect("/login");
  if (permission && !can(u.role, permission)) redirect("/dashboard?forbidden=1");
  return u;
}
