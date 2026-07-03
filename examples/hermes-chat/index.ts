import { createKortexFromEnv } from '@kortex/config';

async function main() {
  const kortex = await createKortexFromEnv({
    env: {
      ...process.env,
      AI_PROVIDER: 'hermes',
      EMBEDDING_PROVIDER: 'provider',
      MEMORY_PROVIDER: 'none',
      VECTOR_PROVIDER: 'none',
    } as NodeJS.ProcessEnv,
  });

  const response = await kortex.chat({
    userId: 'hermes_user',
    sessionId: 'hermes_session',
    message: 'Hello Hermes',
    useMemory: false,
  });

  console.log(response.content);
}

main().catch(console.error);
