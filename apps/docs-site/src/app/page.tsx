import Link from 'next/link';
import { DocsNav } from '@/components/Docs';

export default function Home() {
  return (
    <>
      <DocsNav />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Kortex</h1>
        <p style={{ color: '#a1a1aa', fontSize: '1.1rem' }}>
          Open-source AI Runtime Framework — multi-LLM, memory, vector search, RAG, MCP tools, and
          agents. Bring your own infrastructure.
        </p>

        <section style={{ marginTop: '2.5rem' }}>
          <h2>v1.0 launch capabilities</h2>
          <ul style={{ color: '#d4d4d8' }}>
            <li>
              <strong>Multi-LLM</strong> — OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio,
              OpenClaw, Hermes
            </li>
            <li>
              <strong>Memory</strong> — PostgreSQL or Redis conversation & long-term memory
            </li>
            <li>
              <strong>Vector search</strong> — pgvector or Qdrant
            </li>
            <li>
              <strong>RAG</strong> — ingest, chunk, embed, retrieve, inject context
            </li>
            <li>
              <strong>MCP tools</strong> — register, list, execute tools via runtime
            </li>
            <li>
              <strong>Agents</strong> — memory-enabled, tool-enabled agent execution
            </li>
            <li>
              <strong>Chatbot demo</strong> — Next.js app with streaming UI
            </li>
            <li>
              <strong>Docker</strong> — Postgres+pgvector, Redis, Qdrant
            </li>
          </ul>
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>Install & run</h2>
          <pre style={{ background: '#18181b', padding: '1rem', borderRadius: 8, fontSize: 13 }}>
            {`pnpm install
pnpm build
pnpm test
docker compose up -d
pnpm demo    # chatbot at :3001
pnpm docs    # this site at :3002`}
          </pre>
        </section>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/getting-started" style={{ color: '#a78bfa' }}>
            Get started →
          </Link>
        </p>
      </main>
    </>
  );
}
