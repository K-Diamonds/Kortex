import { Code, DocPage, DocsNav } from '@/components/Docs';

export default function DockerPage() {
  return (
    <>
      <DocsNav />
      <DocPage title="Docker Setup">
        <p>Start all local infrastructure with one command:</p>
        <Code>docker compose up -d</Code>

        <h2>Services</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #3f3f46', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Service</th>
              <th style={{ padding: '0.5rem' }}>Port</th>
              <th style={{ padding: '0.5rem' }}>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #27272a' }}>
              <td style={{ padding: '0.5rem' }}>postgres (pgvector)</td>
              <td style={{ padding: '0.5rem' }}>5432</td>
              <td style={{ padding: '0.5rem' }}>Memory + pgvector embeddings</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #27272a' }}>
              <td style={{ padding: '0.5rem' }}>redis</td>
              <td style={{ padding: '0.5rem' }}>6379</td>
              <td style={{ padding: '0.5rem' }}>Redis memory provider</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #27272a' }}>
              <td style={{ padding: '0.5rem' }}>qdrant</td>
              <td style={{ padding: '0.5rem' }}>6333</td>
              <td style={{ padding: '0.5rem' }}>Qdrant vector store</td>
            </tr>
          </tbody>
        </table>

        <h2>Apply database schema</h2>
        <Code>{`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kortex
pnpm db:schema`}</Code>
      </DocPage>
    </>
  );
}
