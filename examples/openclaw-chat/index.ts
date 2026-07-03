import { createKortexFromEnv } from '@kortex/config';

async function main() {
  const kortex = await createKortexFromEnv({
    env: {
      ...process.env,
      AI_PROVIDER: 'openclaw',
      EMBEDDING_PROVIDER: 'provider',
      MEMORY_PROVIDER: 'none',
      VECTOR_PROVIDER: 'none',
    } as NodeJS.ProcessEnv,
  });

  const response = await kortex.chat({
    userId: 'openclaw_user',
    sessionId: 'openclaw_session',
    message: 'Hello OpenClaw',
    useMemory: false,
  });

  console.log(response.content);
}

main().catch(console.error);
