import Link from 'next/link';
import { Code, DocPage } from '@/components/Docs';

export default function ProviderSetupPage() {
  return (
    <DocPage title="Provider setup">
      <p>
        Kortex never hardcodes a model vendor. Configure providers on the server via{' '}
        <code>.env</code> or <code>createKortex()</code>.
      </p>

      <h2>Environment variables</h2>
      <Code>{`AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-...

# Optional memory + vector
MEMORY_PROVIDER=postgres
VECTOR_PROVIDER=pgvector
DATABASE_URL=postgresql://...
EMBEDDING_DIMENSIONS=1536`}</Code>

      <h2>Bootstrap from .env</h2>
      <Code>{`import { createKortexFromEnv } from "@kortex/config";

const runtime = await createKortexFromEnv();`}</Code>

      <h2>Explicit provider config</h2>
      <Code>{`import { createKortex } from "@kortex/config";

const runtime = await createKortex({
  provider: "anthropic",
  model: "claude-3-5-sonnet-latest",
  apiKey: process.env.ANTHROPIC_API_KEY,
});`}</Code>

      <h2>Self-hosted providers</h2>
      <Code>{`AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
AI_MODEL=llama3.2`}</Code>

      <h2>Provider matrix</h2>
      <p>
        See the full capability matrix and status tiers on the{' '}
        <Link href="/providers">Providers</Link> page.
      </p>
    </DocPage>
  );
}
