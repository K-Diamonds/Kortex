import { createKortexFromEnv } from '@kortex/config';
import { RAGPipeline } from '@kortex/rag';

async function main() {
  const kortex = await createKortexFromEnv();
  const rag = new RAGPipeline(kortex);

  await rag.ingest(
    [{ content: 'Kortex is a bring-your-own-infrastructure AI runtime framework.' }],
    { userId: 'user_rag', sessionId: 'session_rag' },
  );

  const response = await kortex.chat({
    userId: 'user_rag',
    sessionId: 'session_rag',
    message: 'What is Kortex?',
    useRag: true,
  });

  console.log('Response:', response.content);
  console.log('Context chunks:', response.retrievedContext?.chunks.length ?? 0);
}

main().catch(console.error);
