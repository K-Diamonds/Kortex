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
import { getModelForProvider, loadConfig, validateConfig } from './config.js';

export interface CreateKortexOptions {
  env?: NodeJS.ProcessEnv;
  provider?: AIProvider;
  memory?: MemoryProvider;
  vector?: VectorProvider;
  embedding?: EmbeddingProvider;
  tools?: ToolProvider[];
  agents?: AgentProvider;
}

async function loadAIProvider(
  name: string,
  config: ReturnType<typeof loadConfig>,
): Promise<AIProvider> {
  const model = getModelForProvider(config);

  switch (name) {
    case 'openai': {
      const { OpenAIProvider } = await import('@kortex/openai');
      return new OpenAIProvider({
        apiKey: config.openai.apiKey!,
        model,
        baseUrl: config.openai.baseUrl,
      });
    }
    case 'anthropic': {
      const { AnthropicProvider } = await import('@kortex/anthropic');
      return new AnthropicProvider({
        apiKey: config.anthropic.apiKey!,
        model,
        baseUrl: config.anthropic.baseUrl,
      });
    }
    case 'gemini': {
      const { GeminiProvider } = await import('@kortex/gemini');
      return new GeminiProvider({
        apiKey: config.gemini.apiKey!,
        model,
        baseUrl: config.gemini.baseUrl,
      });
    }
    case 'openrouter': {
      const { OpenRouterProvider } = await import('@kortex/openrouter');
      return new OpenRouterProvider({
        apiKey: config.openrouter.apiKey!,
        model,
        baseUrl: config.openrouter.baseUrl,
      });
    }
    case 'ollama': {
      const { OllamaProvider } = await import('@kortex/ollama');
      return new OllamaProvider({ baseUrl: config.ollama.baseUrl, model });
    }
    case 'lmstudio': {
      const { LMStudioProvider } = await import('@kortex/lmstudio');
      return new LMStudioProvider({ baseUrl: config.lmstudio.baseUrl, model });
    }
    case 'openclaw': {
      const { OpenClawProvider } = await import('@kortex/openclaw');
      return new OpenClawProvider({
        baseUrl: config.openclaw.baseUrl,
        model,
        token: config.openclaw.token,
      });
    }
    case 'hermes': {
      const { HermesProvider } = await import('@kortex/hermes');
      return new HermesProvider({
        baseUrl: config.hermes.baseUrl,
        model,
        token: config.hermes.token,
      });
    }
    default:
      throw new Error(`Unsupported AI provider: ${name}`);
  }
}

async function loadMemoryProvider(
  name: string,
  config: ReturnType<typeof loadConfig>,
): Promise<MemoryProvider | undefined> {
  if (name === 'none') return undefined;
  if (name === 'postgres') {
    const { PostgresMemoryProvider } = await import('@kortex/postgres');
    return new PostgresMemoryProvider({ databaseUrl: config.database.url! });
  }
  if (name === 'redis') {
    const { RedisMemoryProvider } = await import('@kortex/redis');
    return new RedisMemoryProvider({ url: config.redis.url! });
  }
  return undefined;
}

async function loadVectorProvider(
  name: string,
  config: ReturnType<typeof loadConfig>,
): Promise<VectorProvider | undefined> {
  if (name === 'none') return undefined;
  if (name === 'pgvector') {
    const { PgVectorProvider } = await import('@kortex/pgvector');
    return new PgVectorProvider({
      databaseUrl: config.database.url!,
      dimensions: config.embeddingDimensions,
    });
  }
  if (name === 'qdrant') {
    const { QdrantVectorProvider } = await import('@kortex/qdrant');
    return new QdrantVectorProvider({
      url: config.qdrant.url!,
      apiKey: config.qdrant.apiKey,
    });
  }
  return undefined;
}

async function loadEmbeddingProvider(
  config: ReturnType<typeof loadConfig>,
  aiProvider: AIProvider,
): Promise<EmbeddingProvider | undefined> {
  switch (config.embeddingProvider) {
    case 'openai': {
      const { OpenAIEmbeddingProvider } = await import('@kortex/openai');
      return new OpenAIEmbeddingProvider({
        apiKey: config.openai.apiKey!,
        model: config.embeddingModel,
        baseUrl: config.openai.baseUrl,
      });
    }
    case 'local': {
      const { OllamaEmbeddingProvider } = await import('@kortex/ollama');
      return new OllamaEmbeddingProvider({
        baseUrl: config.ollama.baseUrl,
        model: config.embeddingModel,
      });
    }
    case 'provider':
      return {
        name: `${aiProvider.name}-embed`,
        embedText: async (text, options) => {
          const result = await aiProvider.embed({
            input: text,
            model: options?.model ?? config.embeddingModel,
          });
          return result.embeddings[0] ?? [];
        },
        embedDocuments: async (texts, options) => {
          const result = await aiProvider.embed({
            input: texts,
            model: options?.model ?? config.embeddingModel,
          });
          return result.embeddings;
        },
      };
    default:
      return undefined;
  }
}

export async function createKortexFromEnv(
  options: CreateKortexOptions = {},
): Promise<KortexRuntime> {
  const env = options.env ?? process.env;
  const config = loadConfig(env);
  validateConfig(config);

  const logger = createLogger({
    name: 'kortex',
    level: config.logging.debug ? 'debug' : config.logging.level,
  });

  const provider = options.provider ?? (await loadAIProvider(config.aiProvider, config));
  await provider.validateConfig();

  const memory =
    options.memory ?? (await loadMemoryProvider(config.memoryProvider, config));
  const vector =
    options.vector ?? (await loadVectorProvider(config.vectorProvider, config));
  const embedding =
    options.embedding ?? (await loadEmbeddingProvider(config, provider));

  const tools: ToolProvider[] = [...(options.tools ?? [])];
  if (config.mcpEnabled) {
    const { BuiltinToolProvider } = await import('@kortex/tools');
    tools.push(new BuiltinToolProvider());
  }

  const runtime = new Runtime({
    provider,
    memory,
    vector,
    embedding,
    tools,
    agents: options.agents,
    logger,
  });

  if (!options.agents) {
    const { KortexAgentProvider } = await import('@kortex/agents');
    return new Runtime({
      provider,
      memory,
      vector,
      embedding,
      tools,
      agents: new KortexAgentProvider(runtime),
      logger,
    });
  }

  return runtime;
}

/** @deprecated Use `createKortexFromEnv` */
export const KortexFactory = { create: createKortexFromEnv };
