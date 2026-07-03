import { createKortexFromEnv } from '@kortex/config';
import type { KortexRuntime } from '@kortex/core';

const cache = new Map<string, Promise<KortexRuntime>>();

export interface RuntimeOverrides {
  aiProvider?: string;
  aiModel?: string;
}

export function getKortex(overrides: RuntimeOverrides = {}): Promise<KortexRuntime> {
  const env = { ...process.env } as NodeJS.ProcessEnv;
  if (overrides.aiProvider) env.AI_PROVIDER = overrides.aiProvider;
  if (overrides.aiModel) env.AI_MODEL = overrides.aiModel;

  const key = `${env.AI_PROVIDER ?? 'openai'}:${env.AI_MODEL ?? ''}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const promise = createKortexFromEnv({ env });
  cache.set(key, promise);
  return promise;
}
