import { Code, DocPage, DocsNav } from '@/components/Docs';

export default function BackendRoutePage() {
  return (
    <>
      <DocsNav />
      <DocPage title="Backend route setup">
        <p>
          The <code>&lt;Kortex /&gt;</code> UI component only receives <code>apiEndpoint</code> and
          UI/runtime flags. It must <strong>never</strong> receive API keys, database URLs, provider
          secrets, tokens, or model credentials.
        </p>
        <p>
          Your backend route owns provider selection, model choice, memory, vector search, RAG, MCP,
          tools, and agents. Use <code>.env</code> on the server (highly recommended) or any secure
          configuration pattern you prefer — secrets must stay server-side.
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

        <h2>Frontend usage</h2>
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

        <h2>React Native</h2>
        <Code>{`import { Kortex } from "@kortex/react-native";

<Kortex
  apiEndpoint="https://mydomain.com/api/kortex/chat"
  title="Ask AI"
  theme="dark"
  memory
  rag
/>`}</Code>

        <h2>Web Components (Vue, Svelte, Angular, Astro)</h2>
        <Code>{`import { registerKortexElement } from "@kortex/ui/element";

registerKortexElement("kortex-ui");

// <kortex-ui
//   api-endpoint="/api/kortex/chat"
//   title="Ask AI"
//   theme="dark"
//   memory
//   rag
// ></kortex-ui>`}</Code>

        <h2>Security checklist</h2>
        <ul>
          <li>Store secrets in server environment variables (`.env` locally, platform secrets in production)</li>
          <li>Never import provider SDKs or secrets in frontend bundles</li>
          <li>
            <code>apiEndpoint</code> can be any route you control — same origin or remote API
          </li>
          <li>Validate <code>userId</code> and <code>sessionId</code> on the server for production apps</li>
        </ul>
      </DocPage>
    </>
  );
}
