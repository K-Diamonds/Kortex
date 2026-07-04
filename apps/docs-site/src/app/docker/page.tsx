import { Code, DocPage } from '@/components/Docs';

export default function DockerPage() {
  return (
    <DocPage title="Docker Setup">
      <p>Start all local infrastructure with one command:</p>
      <Code>docker compose up -d</Code>

      <h2>Services</h2>
      <div className="docs-table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Port</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>postgres (pgvector)</td>
              <td>5432</td>
              <td>Memory + pgvector embeddings</td>
            </tr>
            <tr>
              <td>redis</td>
              <td>6379</td>
              <td>Redis memory provider</td>
            </tr>
            <tr>
              <td>qdrant</td>
              <td>6333</td>
              <td>Qdrant vector store</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Apply database schema</h2>
      <p style={{ color: '#d4d4d8' }}>
        Set <code>EMBEDDING_DIMENSIONS</code> in <code>.env</code> before the first bootstrap if you
        are not using the default <code>1536</code>. pgvector column size cannot be changed safely
        after the <code>embeddings</code> table is created.
      </p>
      <Code>{`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kortex
EMBEDDING_DIMENSIONS=1536
pnpm db:schema`}</Code>
    </DocPage>
  );
}
