import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function MinimumSetupPage() {
  return (
    <DocPage title="Minimum working setup">
      <SecurityNote />
      <p>
        The smallest path to a working chat: <strong>OpenAI only</strong>, no database, no RAG, no
        vector store. One backend route + <code>&lt;Kortex /&gt;</code>.
      </p>

      <div className="docs-callout docs-callout-success">
        Goal: send a message from the widget and get an OpenAI reply. Under 10 minutes.
      </div>

      <h2>1. Install packages</h2>
      <Code>{`pnpm add @kortex/ui @kortex/core @kortex/config @kortex/openai react react-dom`}</Code>

      <h2>2. Server environment</h2>
      <Code>{`# .env (server only — never expose to the browser)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
MEMORY_PROVIDER=none
VECTOR_PROVIDER=none`}</Code>

      <h2>3. Backend route (Next.js example)</h2>
      <Code>{`// app/api/kortex/chat/route.ts
import { createKortexFromEnv } from "@kortex/config";

let runtime: Awaited<ReturnType<typeof createKortexFromEnv>> | null = null;

async function getKortex() {
  runtime ??= await createKortexFromEnv();
  return runtime;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { message, userId, sessionId } = body;

  if (!message?.trim() || !userId || !sessionId) {
    return Response.json({ error: "message, userId, sessionId required" }, { status: 400 });
  }

  const kortex = await getKortex();
  const response = await kortex.chat({
    userId,
    sessionId,
    message: message.trim(),
    useMemory: false,
    useRag: false,
  });

  return Response.json({ content: response.content, model: response.model });
}`}</Code>
      <p>
        Other frameworks: <Link href="/backend-route/express">Express</Link>,{' '}
        <Link href="/backend-route/fastify">Fastify</Link>,{' '}
        <Link href="/backend-route/hono">Hono</Link>,{' '}
        <Link href="/backend-route/node-http">Node HTTP</Link>.
      </p>

      <h2>4. Frontend widget</h2>
      <Code>{`"use client";

import { Kortex } from "@kortex/ui";

export function Chat() {
  return (
    <Kortex
      apiEndpoint="/api/kortex/chat"
      title="Kortex"
      theme="dark"
      variant="widget"
      stream={false}
    />
  );
}`}</Code>

      <h2>What you are not setting up (yet)</h2>
      <ul>
        <li>
          No <code>DATABASE_URL</code> — memory stays off
        </li>
        <li>No pgvector / Qdrant — RAG stays off</li>
        <li>No MCP, tools, or agents — add later via backend config</li>
      </ul>

      <h2>Next steps</h2>
      <ul>
        <li>
          <Link href="/memory-vector">Add Postgres memory</Link>
        </li>
        <li>
          <Link href="/rag">Enable RAG</Link>
        </li>
        <li>
          <Link href="/packages/ui/theming">Theme the widget</Link>
        </li>
        <li>
          <Link href="/getting-started/installation-by-use-case">Install by use case</Link>
        </li>
      </ul>
    </DocPage>
  );
}
