import Link from 'next/link';
import { Code, DocPage } from '@/components/Docs';

export default function BackendRouteNextjsPage() {
  return (
    <DocPage title="Next.js route">
      <p>App Router example with <code>createKortexFromEnv()</code> and JSON response (non-streaming).</p>
      <Code>{`// app/api/kortex/chat/route.ts
import { createKortexFromEnv } from "@kortex/config";

export const runtime = "nodejs";

let runtimePromise: ReturnType<typeof createKortexFromEnv> | null = null;

function getKortex() {
  runtimePromise ??= createKortexFromEnv();
  return runtimePromise;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { message, userId, sessionId, memory, rag } = body;

  if (!message?.trim() || !userId || !sessionId) {
    return Response.json({ error: "message, userId, sessionId required" }, { status: 400 });
  }

  const kortex = await getKortex();
  const response = await kortex.chat({
    userId,
    sessionId,
    message: message.trim(),
    useMemory: Boolean(memory),
    useRag: Boolean(rag),
  });

  return Response.json({ content: response.content, model: response.model });
}`}</Code>
      <p>
        See <Link href="/getting-started/minimum-setup">Minimum setup</Link> for a complete Next.js
        example.
      </p>
    </DocPage>
  );
}
