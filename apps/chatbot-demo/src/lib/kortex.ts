import { createKortexFromEnv as bootstrapKortex } from '@kortex/config';
import type { KortexRuntime } from '@kortex/core';

let runtimePromise: Promise<KortexRuntime> | null = null;

export function getKortex(): Promise<KortexRuntime> {
  runtimePromise ??= bootstrapKortex({ env: process.env });
  return runtimePromise;
}
