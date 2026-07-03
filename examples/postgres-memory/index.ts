import { createKortexFromEnv } from '@kortex/config';

async function main() {
  const kortex = await createKortexFromEnv({
    env: {
      ...process.env,
      MEMORY_PROVIDER: 'postgres',
      DATABASE_URL: process.env.DATABASE_URL,
    } as NodeJS.ProcessEnv,
  });

  await kortex.remember({ userId: 'user_pg', content: 'Prefers PostgreSQL for memory' });
  const memories = await kortex.searchMemory({ userId: 'user_pg', query: 'PostgreSQL' });
  console.log(memories);
}

main().catch(console.error);
