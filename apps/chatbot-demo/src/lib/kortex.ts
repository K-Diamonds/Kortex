import { createKortexFromEnv as bootstrapKortex } from '@kortex/config';
import type { KortexRuntime } from '@kortex/core';
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

loadDotenv({ path: resolve(process.cwd(), '../../.env') });

function demoEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  if (!env.EMBEDDING_PROVIDER?.trim() || (env.EMBEDDING_PROVIDER === 'openai' && !env.OPENAI_API_KEY?.trim())) {
    env.EMBEDDING_PROVIDER = env.AI_PROVIDER === 'ollama' ? 'local' : 'provider';
  }
  return env;
}

let runtimePromise: Promise<KortexRuntime> | null = null;

export function getKortex(): Promise<KortexRuntime> {
  runtimePromise ??= bootstrapKortex({ env: demoEnv() });
  return runtimePromise;
}
