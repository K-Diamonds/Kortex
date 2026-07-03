import { Code, DocPage, DocsNav } from '@/components/Docs';

export default function MemoryVectorPage() {
  return (
    <>
      <DocsNav />
      <DocPage title="Memory & Vector Search">
        <h2>Memory providers</h2>
        <Code>{`MEMORY_PROVIDER=postgres | redis | none
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kortex
REDIS_URL=redis://localhost:6379`}</Code>
        <ul>
          <li>
            <strong>PostgresMemoryProvider</strong> — persistent messages & memories in PostgreSQL
          </li>
          <li>
            <strong>RedisMemoryProvider</strong> — fast in-memory session storage
          </li>
        </ul>

        <h2>Vector providers</h2>
        <Code>{`VECTOR_PROVIDER=pgvector | qdrant | none
QDRANT_URL=http://localhost:6333`}</Code>
        <ul>
          <li>
            <strong>PgVectorProvider</strong> — embeddings in PostgreSQL with pgvector HNSW index
          </li>
          <li>
            <strong>QdrantVectorProvider</strong> — dedicated vector database
          </li>
        </ul>

        <h2>Runtime API</h2>
        <Code>{`await kortex.remember({ userId: "u1", content: "likes TypeScript" });
const memories = await kortex.searchMemory({ userId: "u1", query: "TypeScript" });
const ctx = await kortex.retrieveContext({ query: "docs", userId: "u1" });`}</Code>
      </DocPage>
    </>
  );
}
