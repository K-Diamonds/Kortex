import Link from 'next/link';
import { Code, DocPage } from '@/components/Docs';

export default function BackendRouteIndexPage() {
  return (
    <DocPage title="Backend route setup">
      <p>
        UI components only receive <code>apiEndpoint</code> and UI/runtime flags. They must{' '}
        <strong>never</strong> receive API keys, database URLs, provider secrets, tokens, or model
        credentials.
      </p>
      <p>
        Your backend route owns provider selection, model, API keys/tokens, memory, database, vector
        store, RAG, MCP, tools, and agents.
      </p>

      <h2>Start here</h2>
      <ul>
        <li>
          <Link href="/getting-started/minimum-setup">Minimum working setup</Link> — OpenAI only, no
          database
        </li>
        <li>
          <Link href="/provider-setup">Provider setup</Link> — swap LLM vendors via env
        </li>
      </ul>

      <h2>Route examples by framework</h2>
      <div className="docs-doc-grid">
        {[
          { href: '/backend-route/nextjs', label: 'Next.js', desc: 'App Router route handler' },
          { href: '/backend-route/express', label: 'Express', desc: 'Node HTTP middleware' },
          { href: '/backend-route/fastify', label: 'Fastify', desc: 'Plugin-style handler' },
          { href: '/backend-route/hono', label: 'Hono', desc: 'Edge or Node fetch API' },
          { href: '/backend-route/node-http', label: 'Node HTTP', desc: 'Vanilla createServer' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="docs-doc-card">
            <span className="docs-doc-card-label">{item.label}</span>
            <span className="docs-doc-card-desc">{item.desc}</span>
          </Link>
        ))}
      </div>

      <h2>Environment bootstrap</h2>
      <Code>{`import { createKortexFromEnv } from "@kortex/config";

const runtime = await createKortexFromEnv();`}</Code>

      <p>
        <Link href="/security">Security</Link> · <Link href="/packages/ui">@kortex/ui</Link>
      </p>
    </DocPage>
  );
}
