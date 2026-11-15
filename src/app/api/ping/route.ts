// Reachability check for phones: answers instantly, touches no data, needs no login.
export const dynamic = "force-dynamic";
export function GET() { return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } }); }
