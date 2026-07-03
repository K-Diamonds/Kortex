import { KortexRuntime } from '@kortex/core';
import { createKortexFromEnv, type CreateKortexOptions } from '@kortex/config';

export type { CreateKortexOptions as FromEnvOptions };

/** @deprecated Use `createKortexFromEnv()` from `@kortex/config` */
export async function fromEnv(options: CreateKortexOptions = {}): Promise<KortexRuntime> {
  return createKortexFromEnv(options);
}

export { KortexRuntime, createKortexFromEnv, createKortexFromEnv as createRuntimeFromEnv };
export type * from '@kortex/core';
