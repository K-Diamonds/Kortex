import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function GettingStartedPage() {
  return (
    <DocPage title="Getting Started">
      <SecurityNote />

      <p>
        <strong>Kortex is currently in alpha / developer preview.</strong> It is not
        production-ready yet. The most reliable stack today is OpenAI + Postgres memory + pgvector.
      </p>

      <h2>Recommended paths</h2>
      <ul>
        <li>
          <Link href="/getting-started/minimum-setup">Minimum working setup</Link> — OpenAI +{' '}
          <code>&lt;Kortex /&gt;</code>, no database
        </li>
        <li>
          <Link href="/getting-started/installation-by-use-case">Installation by use case</Link> —
          UI only, backend, Postgres+pgvector, React Native
        </li>
        <li>
          <Link href="/packages/ui/quickstart">@kortex/ui quick start</Link>
        </li>
      </ul>

      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 20+</li>
        <li>pnpm 9+</li>
        <li>An LLM API key (or local Ollama/LM Studio)</li>
        <li>Docker (optional, for Postgres/Redis/Qdrant)</li>
      </ul>

      <h2>Install</h2>
      <Code>{`git clone https://github.com/KOfferman/Kortex.git
cd Kortex
corepack enable
pnpm install
cp .env.example .env`}</Code>

      <h2>Run the docs site</h2>
      <Code>{`pnpm build
pnpm docs
# → http://localhost:3001`}</Code>

      <h2>Full stack with Docker</h2>
      <Code>{`docker compose up -d
# .env:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kortex
# MEMORY_PROVIDER=postgres
# VECTOR_PROVIDER=pgvector
pnpm db:schema
pnpm docs`}</Code>

      <h2>Bootstrap from environment</h2>
      <Code>{`import { createKortexFromEnv } from "@kortex/config";

const kortex = await createKortexFromEnv();

const response = await kortex.chat({
  userId: "user_123",
  sessionId: "session_456",
  message: "Hello!",
  useMemory: true,
  useRag: true,
});`}</Code>

      <h2>Manual wiring</h2>
      <Code>{`import { KortexRuntime } from "@kortex/core";
import { OpenAIProvider } from "@kortex/openai";
import { PostgresMemoryProvider } from "@kortex/postgres";
import { PgVectorProvider } from "@kortex/pgvector";

const kortex = new KortexRuntime({
  provider: new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! }),
  memory: new PostgresMemoryProvider({ databaseUrl: process.env.DATABASE_URL! }),
  vector: new PgVectorProvider({ databaseUrl: process.env.DATABASE_URL! }),
});`}</Code>
    </DocPage>
  );
}
