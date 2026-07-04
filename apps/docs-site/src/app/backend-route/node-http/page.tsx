import Link from 'next/link';
import { Code, DocPage } from '@/components/Docs';

export default function BackendRouteNodeHttpPage() {
  return (
    <DocPage title="Node HTTP route">
      <Code>{`import { createServer } from "node:http";
import { createKortexFromEnv } from "@kortex/config";

let runtimePromise: ReturnType<typeof createKortexFromEnv> | null = null;

function getKortex() {
  runtimePromise ??= createKortexFromEnv();
  return runtimePromise;
}

async function readJson(req: import("node:http").IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/api/kortex/chat") {
    res.writeHead(404).end();
    return;
  }

  try {
    const body = await readJson(req);
    const { message, userId, sessionId, memory, rag } = body;

    if (!message?.trim() || !userId || !sessionId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "message, userId, sessionId required" }));
      return;
    }

    const kortex = await getKortex();
    const response = await kortex.chat({
      userId,
      sessionId,
      message: message.trim(),
      useMemory: Boolean(memory),
      useRag: Boolean(rag),
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ content: response.content, model: response.model }));
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: errMsg }));
  }
}).listen(3000);`}</Code>
      <p>
        <Link href="/backend-route/express">Express</Link> is usually simpler for routing.{' '}
        <Link href="/getting-started/minimum-setup">Minimum setup</Link>
      </p>
    </DocPage>
  );
}
