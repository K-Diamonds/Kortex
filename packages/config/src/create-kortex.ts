import type {
  AgentProvider,
  AIProvider,
  EmbeddingProvider,
  KortexRuntime,
  MemoryProvider,
  ToolProvider,
  VectorProvider,
} from '@kortex/core';
import { KortexRuntime as Runtime } from '@kortex/core';
import { createLogger } from '@kortex/logger';
import type { AIProviderName } from './config.js';

export interface KortexMemoryConfig {
  provider: 'postgres' | 'redis';
  connectionString?: string;
  url?: string;
}

export interface KortexVectorConfig {
  provider: 'pgvector' | 'qdrant';
  connectionString?: string;
  url?: string;
  apiKey?: string;
  dimensions?: number;
}

export interface KortexBackendConfig {
  provider: AIProviderName | AIProvider;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  token?: string;

  memory?: KortexMemoryConfig | MemoryProvider;
  vector?: KortexVectorConfig | VectorProvider;
  embedding?: EmbeddingProvider;

  tools?: ToolProvider[];
  agents?: AgentProvider;
  mcpEnabled?: boolean;
  embeddingDimensions?: number;

  logger?: ReturnType<typeof createLogger>;
}

async function resolveProvider(config: KortexBackendConfig): Promise<AIProvider> {
  if (typeof config.provider !== 'string') {
    return config.provider;
  }

  const model = config.model;

  switch (config.provider) {
    case 'openai': {
      const { OpenAIProvider } = await import('@kortex/openai');
      if (!config.apiKey) throw new Error('apiKey is required for OpenAI provider');
      return new OpenAIProvider({ apiKey: config.apiKey, model, baseUrl: config.baseUrl });
    }
    case 'anthropic': {
      const { AnthropicProvider } = await import('@kortex/anthropic');
      if (!config.apiKey) throw new Error('apiKey is required for Anthropic provider');
      return new AnthropicProvider({ apiKey: config.apiKey, model, baseUrl: config.baseUrl });
    }
    case 'gemini': {
      const { GeminiProvider } = await import('@kortex/gemini');
      if (!config.apiKey) throw new Error('apiKey is required for Gemini provider');
      return new GeminiProvider({ apiKey: config.apiKey, model, baseUrl: config.baseUrl });
    }
    case 'openrouter': {
      const { OpenRouterProvider } = await import('@kortex/openrouter');
      if (!config.apiKey) throw new Error('apiKey is required for OpenRouter provider');
      return new OpenRouterProvider({ apiKey: config.apiKey, model, baseUrl: config.baseUrl });
    }
    case 'ollama': {
      const { OllamaProvider } = await import('@kortex/ollama');
      return new OllamaProvider({ baseUrl: config.baseUrl, model });
    }
    case 'lmstudio': {
      const { LMStudioProvider } = await import('@kortex/lmstudio');
      return new LMStudioProvider({ baseUrl: config.baseUrl, model });
    }
    case 'openclaw': {
      const { OpenClawProvider } = await import('@kortex/openclaw');
      return new OpenClawProvider({ baseUrl: config.baseUrl, model, token: config.token });
    }
    case 'hermes': {
      const { HermesProvider } = await import('@kortex/hermes');
      return new HermesProvider({ baseUrl: config.baseUrl, model, token: config.token });
    }
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

async function resolveMemory(
  memory: KortexBackendConfig['memory'],
): Promise<MemoryProvider | undefined> {
  if (!memory) return undefined;
  if (typeof memory === 'object' && 'saveMessage' in memory) return memory;

  if (memory.provider === 'postgres') {
    const connectionString = memory.connectionString;
    if (!connectionString) throw new Error('memory.connectionString is required for postgres');
    const { PostgresMemoryProvider } = await import('@kortex/postgres');
    return new PostgresMemoryProvider({ databaseUrl: connectionString });
  }

  const url = memory.url;
  if (!url) throw new Error('memory.url is required for redis');
  const { RedisMemoryProvider } = await import('@kortex/redis');
  return new RedisMemoryProvider({ url });
}

async function resolveVector(
  vector: KortexBackendConfig['vector'],
  embeddingDimensions?: number,
): Promise<VectorProvider | undefined> {
  if (!vector) return undefined;
  if (typeof vector === 'object' && 'search' in vector) return vector;

  if (vector.provider === 'pgvector') {
    const connectionString = vector.connectionString;
    if (!connectionString) throw new Error('vector.connectionString is required for pgvector');
    const { PgVectorProvider } = await import('@kortex/pgvector');
    return new PgVectorProvider({
      databaseUrl: connectionString,
      dimensions: vector.dimensions ?? embeddingDimensions,
    });
  }

  const url = vector.url;
  if (!url) throw new Error('vector.url is required for qdrant');
  const { QdrantVectorProvider } = await import('@kortex/qdrant');
  return new QdrantVectorProvider({ url, apiKey: vector.apiKey });
}

/**
 * Create a Kortex runtime from explicit backend configuration.
 * Use in API routes — never pass secrets to `@kortex/ui`.
 */
export async function createKortex(config: KortexBackendConfig): Promise<KortexRuntime> {
  const logger = config.logger ?? createLogger({ name: 'kortex' });
  const provider = await resolveProvider(config);
  await provider.validateConfig();

  const memory = await resolveMemory(config.memory);
  const vector = await resolveVector(config.vector, config.embeddingDimensions);

  const tools: ToolProvider[] = [...(config.tools ?? [])];
  if (config.mcpEnabled) {
    const { BuiltinToolProvider } = await import('@kortex/tools');
    tools.push(new BuiltinToolProvider());
  }

  const runtime = new Runtime({
    provider,
    memory,
    vector,
    embedding: config.embedding,
    tools,
    agents: config.agents,
    logger,
  });

  if (!config.agents) {
    const { KortexAgentProvider } = await import('@kortex/agents');
    return new Runtime({
      provider,
      memory,
      vector,
      embedding: config.embedding,
      tools,
      agents: new KortexAgentProvider(runtime),
      logger,
    });
  }

  return runtime;
}
