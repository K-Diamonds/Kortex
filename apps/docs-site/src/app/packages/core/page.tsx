import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function CorePackagePage() {
  return (
      <DocPage title="@kortex/core">
        <SecurityNote />

        <p>
          <code>@kortex/core</code> is the backend runtime. It defines interfaces and orchestrates
          chat, streaming, memory, vector retrieval, RAG, tools, and agents — without importing
          concrete providers at compile time.
        </p>

        <h2>Install</h2>
        <Code>{`pnpm add @kortex/core`}</Code>

        <h2>Exports</h2>
        <ul>
          <li><code>KortexRuntime</code> — main orchestrator</li>
          <li><code>AIProvider</code>, <code>MemoryProvider</code>, <code>VectorProvider</code></li>
          <li><code>chat()</code>, <code>stream()</code>, <code>remember()</code>, <code>retrieveContext()</code></li>
          <li><code>ingest()</code>, <code>runTool()</code>, <code>runAgent()</code></li>
        </ul>

        <h2>Manual wiring (server-side only)</h2>
        <Code>{`import { KortexRuntime } from "@kortex/core";
import { OpenAIProvider } from "@kortex/openai";
import { PostgresMemoryProvider } from "@kortex/postgres";
import { PgVectorProvider } from "@kortex/pgvector";

const runtime = new KortexRuntime({
  provider: new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! }),
  memory: new PostgresMemoryProvider({ databaseUrl: process.env.DATABASE_URL! }),
  vector: new PgVectorProvider({ databaseUrl: process.env.DATABASE_URL! }),
});`}</Code>

        <p>
          Prefer <Link href="/packages/config">@kortex/config</Link> for env-based bootstrap. Never
          import <code>@kortex/core</code> with hardcoded secrets in frontend code.
        </p>
      </DocPage>
  );
}
