import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ConfigPackagePage() {
  return (
    <DocPage title="@kortex/config">
      <SecurityNote />

      <p>
        <code>@kortex/config</code> wires the runtime from environment variables or explicit backend
        configuration. Use it in API routes, workers, and CLI tools — never in frontend bundles.
      </p>

      <h2>Install</h2>
      <Code>{`pnpm add @kortex/config`}</Code>

      <h2>Exports</h2>
      <ul>
        <li>
          <code>createKortex(config)</code> — declarative provider, memory, and vector setup
        </li>
        <li>
          <code>createKortexFromEnv()</code> — load adapters from <code>.env</code>
        </li>
        <li>
          <code>loadConfig()</code>, <code>validateConfig()</code>
        </li>
      </ul>

      <h2>createKortex()</h2>
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
});`}</Code>

      <h2>createKortexFromEnv()</h2>
      <p>
        Reads <code>.env</code> when present (highly recommended). You may also pass{' '}
        <code>{'{ env: process.env }'}</code> from any server-side config source.
      </p>
      <Code>{`import { createKortexFromEnv } from "@kortex/config";

const runtime = await createKortexFromEnv();`}</Code>

      <p>
        See <Link href="/backend-route">Backend route setup</Link> and{' '}
        <Link href="/provider-setup">Provider setup</Link>.
      </p>
    </DocPage>
  );
}
