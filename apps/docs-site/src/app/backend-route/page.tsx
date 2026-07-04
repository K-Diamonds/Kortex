import Link from 'next/link';
import { Code, DocPage } from '@/components/Docs';

export default function BackendRoutePage() {
  return (
      <DocPage title="Backend route setup">
        <p>
          UI components only receive <code>apiEndpoint</code> and UI/runtime flags. They must{' '}
          <strong>never</strong> receive API keys, database URLs, provider secrets, tokens, or model
          credentials.
        </p>
        <p>
          Your backend route owns provider selection, model, API keys/tokens, memory, database,
          vector store, RAG, MCP, tools, and agents. Use <code>.env</code> on the server (highly
          recommended but not required) or any secure configuration pattern — secrets must stay
          server-side.
        </p>

        <h2>Next.js route example</h2>
        <Code>{`import { createKortex } from "@kortex/config";

const runtime = await createKortex({
  provider: "openai",
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,

  memory: {
    provider: "postgres",
    connectionString: process.env.DATABASE_URL,
  },

  vector: {
    provider: "pgvector",
    connectionString: process.env.DATABASE_URL,
    dimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 1536),
  },
});

export async function POST(req: Request) {
  const body = await req.json();

  const response = await runtime.chat({
    userId: body.userId,
    sessionId: body.sessionId,
    message: body.message,
    useMemory: body.memory,
    useRag: body.rag,
  });

  return Response.json({
    content: response.content,
    model: response.model,
  });
}`}</Code>

        <h2>Environment bootstrap</h2>
        <p>
          For demos and monorepo development, you can also use{' '}
          <code>createKortexFromEnv()</code> which reads <code>.env</code> and loads adapters
          dynamically:
        </p>
        <Code>{`import { createKortexFromEnv } from "@kortex/config";

const runtime = await createKortexFromEnv();`}</Code>

        <h2>Frontend usage by platform</h2>
        <p><strong>React / Next.js</strong> — use the React component:</p>
        <Code>{`import { Kortex } from "@kortex/ui";

<Kortex
  apiEndpoint="/api/kortex/chat"
  title="Ask AI"
  subtitle="Powered by Kortex"
  theme="dark"
  variant="widget"
  position="bottom-right"
  memory
  rag
  tools
/>`}</Code>

        <p><strong>Vue / Svelte / Angular / Astro / HTML</strong> — no wrapper packages; use the Web Component (not <code>&lt;Kortex /&gt;</code>):</p>
        <Code>{`import { registerKortexElement } from "@kortex/ui/element";

registerKortexElement("kortex-ui");

<kortex-ui
  api-endpoint="/api/kortex/chat"
  title="Ask AI"
  theme="dark"
  memory
  rag
></kortex-ui>`}</Code>

        <p><strong>React Native</strong> — use the native component:</p>
        <Code>{`import { Kortex } from "@kortex/react-native";

<Kortex
  apiEndpoint="https://mydomain.com/api/kortex/chat"
  title="Ask AI"
  theme="dark"
  memory
  rag
/>`}</Code>

        <p>
          See <Link href="/packages/ui">@kortex/ui</Link>,{' '}
          <Link href="/packages/react-native">@kortex/react-native</Link>, and{' '}
          <Link href="/security">Security</Link> for details.
        </p>
      </DocPage>
  );
}
