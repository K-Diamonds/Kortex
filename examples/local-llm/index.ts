import { createKortexFromEnv } from '@kortex/config';

async function main() {
  const kortex = await createKortexFromEnv({
    env: {
      ...process.env,
      AI_PROVIDER: 'ollama',
      EMBEDDING_PROVIDER: 'provider',
      MEMORY_PROVIDER: 'none',
      VECTOR_PROVIDER: 'none',
    } as NodeJS.ProcessEnv,
  });

  const response = await kortex.chat({
    userId: 'local_user',
    sessionId: 'local_session',
    message: 'Hello from Ollama!',
    useMemory: false,
  });

  console.log(response.content);
}

main().catch(console.error);
