import { createKortexFromEnv } from '@kortex/config';
import { RAGPipeline } from '@kortex/rag';

async function main() {
  const kortex = await createKortexFromEnv();
  const rag = new RAGPipeline(kortex);

  await rag.ingest([
    {
      id: 'doc-1',
      content:
        'Kortex is an AI Runtime Framework for building scalable chatbots, agents, RAG pipelines, and multi-LLM applications.',
      metadata: { source: 'readme' },
    },
  ]);

  const response = await kortex.chat({
    userId: 'user_rag',
    sessionId: 'session_rag',
    message: 'Explain what Kortex is.',
    useRag: true,
  });

  console.log('Response:', response.content);
}

main().catch(console.error);
