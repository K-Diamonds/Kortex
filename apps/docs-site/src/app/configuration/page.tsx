import { Code, DocPage, DocsNav } from '@/components/Docs';

export default function ConfigurationPage() {
  return (
    <>
      <DocsNav />
      <DocPage title="Environment Configuration">
        <Code>{`# AI
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=

# Local providers
OLLAMA_BASE_URL=http://localhost:11434
LMSTUDIO_BASE_URL=http://localhost:1234
OPENCLAW_BASE_URL=http://localhost:18789
HERMES_BASE_URL=http://localhost:3000

# Memory
MEMORY_PROVIDER=none
DATABASE_URL=
REDIS_URL=redis://localhost:6379

# Vector
VECTOR_PROVIDER=none
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

# Embeddings
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# Tools & debug
MCP_ENABLED=false
KORTEX_DEBUG=true`}</Code>
        <p>
          See <code>.env.example</code> in the repository root for the canonical template.
        </p>
      </DocPage>
    </>
  );
}
