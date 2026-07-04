import Link from 'next/link';
import { Code, DocPage } from '@/components/Docs';

export default function BackendRouteHonoPage() {
  return (
    <DocPage title="Hono route">
      <Code>{`import { Hono } from "hono";
import { createKortexFromEnv } from "@kortex/config";

const app = new Hono();

let runtimePromise: ReturnType<typeof createKortexFromEnv> | null = null;

function getKortex() {
  runtimePromise ??= createKortexFromEnv();
  return runtimePromise;
}

app.post("/api/kortex/chat", async (c) => {
  const body = await c.req.json();
  const { message, userId, sessionId, memory, rag } = body;

  if (!message?.trim() || !userId || !sessionId) {
    return c.json({ error: "message, userId, sessionId required" }, 400);
  }

  const kortex = await getKortex();
  const response = await kortex.chat({
    userId,
    sessionId,
    message: message.trim(),
    useMemory: Boolean(memory),
    useRag: Boolean(rag),
  });

  return c.json({ content: response.content, model: response.model });
});

export default app;`}</Code>
      <p>
        Works on Node, Bun, Cloudflare Workers (with compatible adapters).{' '}
        <Link href="/getting-started/minimum-setup">Minimum setup</Link>
      </p>
    </DocPage>
  );
}
