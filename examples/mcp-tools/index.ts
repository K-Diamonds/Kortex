import { createKortexFromEnv } from '@kortex/config';

async function main() {
  const kortex = await createKortexFromEnv();

  const result = await kortex.runTool('get_current_time', {});
  console.log('Current time:', result);
}

main().catch(console.error);
