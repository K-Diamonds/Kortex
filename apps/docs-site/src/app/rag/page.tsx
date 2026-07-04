import { Code, DocPage } from '@/components/Docs';

export default function RagPage() {
  return (
    <DocPage title="RAG Pipeline">
      <p>
        Kortex RAG covers document ingestion, text chunking, embedding generation, vector storage,
        context retrieval, and prompt injection.
      </p>

      <h2>Ingest via runtime</h2>
      <Code>{`await kortex.ingest({
  documents: [{ content: "Your document text...", metadata: { source: "manual" } }],
  userId: "user_1",
  chunkSize: 1000,
  chunkOverlap: 200,
});`}</Code>

      <h2>RAG pipeline package</h2>
      <Code>{`import { RAGPipeline } from "@kortex/rag";

const rag = new RAGPipeline(kortex);
await rag.ingest(documents, { userId: "u1", sessionId: "s1" });
const chunks = await rag.retrieve({ query: "topic", limit: 5 });`}</Code>

      <h2>Chat with RAG</h2>
      <Code>{`const response = await kortex.chat({
  userId: "u1",
  sessionId: "s1",
  message: "Summarize the uploaded docs",
  useRag: true,
});
// response.retrievedContext contains matched chunks`}</Code>
    </DocPage>
  );
}
