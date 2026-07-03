import { createKortexFromEnv } from '@kortex/config';

async function main() {
  const kortex = await createKortexFromEnv();

  await kortex.chat({
    userId: 'user_1',
    sessionId: 'session_1',
    message: 'My name is Alex.',
    useMemory: true,
  });

  const followUp = await kortex.chat({
    userId: 'user_1',
    sessionId: 'session_1',
    message: 'What is my name?',
    useMemory: true,
  });

  console.log('Follow-up:', followUp.content);
}

main().catch(console.error);
