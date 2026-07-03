import type {
  AgentProvider,
  AIProvider,
  EmbeddingProvider,
  MemoryProvider,
  ToolProvider,
  VectorProvider,
} from './types.js';
import type { KortexRuntime } from './runtime.js';

export interface FromEnvOptions {
  env?: NodeJS.ProcessEnv;
  provider?: AIProvider;
  memory?: MemoryProvider;
  vector?: VectorProvider;
  embedding?: EmbeddingProvider;
  tools?: ToolProvider[];
  agents?: AgentProvider;
}

/** Loads `KortexRuntime` from environment via `@kortex/config` (dynamic import). */
export async function fromEnv(options: FromEnvOptions = {}): Promise<KortexRuntime> {
  const { createKortexFromEnv } = (await import('@kortex/config')) as unknown as {
    createKortexFromEnv: (opts: FromEnvOptions) => Promise<KortexRuntime>;
  };
  return createKortexFromEnv(options);
}
