// Server-Sent Events stream for live updates (see src/lib/live.ts). Signed-in users only; carries a signal, never data.
import { getSession } from "@/lib/auth";
import { onChange } from "@/lib/live";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });
  const encoder = new TextEncoder();
  let stop = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => { try { controller.enqueue(encoder.encode(chunk)); } catch { stop(); } };
      const off = onChange(() => send(`event: change\ndata: ${Date.now()}\n\n`));
      const ping = setInterval(() => send(": ping\n\n"), 25_000); // keeps idle connections from being dropped
      stop = () => { off(); clearInterval(ping); };
      req.signal.addEventListener("abort", () => { stop(); try { controller.close(); } catch { /* already closed */ } });
      send("retry: 3000\n\n"); // browser reconnects 3s after a drop
    },
    cancel() { stop(); },
  });
  // no-transform stops the server from compressing (and so buffering) the stream
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
}
