import { createKortexFromEnv } from '@kortex/config';

async function main() {
  const kortex = await createKortexFromEnv();

  const response = await kortex.chat({
    userId: 'user_demo',
    sessionId: 'session_demo',
    message: 'Hello! What is Kortex?',
    useMemory: false,
  });

  console.log('Response:', response.content);
}

main().catch(console.error);
