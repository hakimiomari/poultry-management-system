import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

/** Clears the session cookie and returns to the login page. Used when a session no longer matches an active account. */
export async function GET(req: Request) {
  await logout();
  return NextResponse.redirect(new URL("/login", req.url));
}
