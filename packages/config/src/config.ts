export type AIProviderName =
  'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama' | 'lmstudio' | 'openclaw' | 'hermes';

export type MemoryProviderName = 'postgres' | 'redis' | 'none';
export type VectorProviderName = 'pgvector' | 'qdrant' | 'none';
export type EmbeddingProviderName = 'openai' | 'local' | 'provider';

export interface KortexConfig {
  aiProvider: AIProviderName;
  aiModel?: string;
  memoryProvider: MemoryProviderName;
  vectorProvider: VectorProviderName;
  embeddingProvider: EmbeddingProviderName;
  embeddingModel: string;
  embeddingDimensions: number;
  mcpEnabled: boolean;
  openai: { apiKey?: string; model: string; baseUrl?: string };
  anthropic: { apiKey?: string; model: string; baseUrl?: string };
  gemini: { apiKey?: string; model: string; baseUrl?: string };
  openrouter: { apiKey?: string; model: string; baseUrl?: string };
  ollama: { baseUrl: string; model: string };
  lmstudio: { baseUrl: string; model: string };
  openclaw: { baseUrl: string; model: string; token?: string };
  hermes: { baseUrl: string; model: string; token?: string };
  database: { url?: string };
  redis: { url?: string };
  qdrant: { url?: string; apiKey?: string };
  logging: { level: 'debug' | 'info' | 'warn' | 'error'; debug: boolean };
}

import { ConfigError } from '@kortex/errors';

export { ConfigError };

function getEnv(env: NodeJS.ProcessEnv, key: string, defaultValue?: string): string | undefined {
  return env[key] ?? defaultValue;
}

function bool(env: NodeJS.ProcessEnv, key: string, defaultValue = false): boolean {
  const value = env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

export function getModelForProvider(config: KortexConfig): string {
  if (config.aiModel) return config.aiModel;
  switch (config.aiProvider) {
    case 'anthropic':
      return config.anthropic.model;
    case 'gemini':
      return config.gemini.model;
    case 'openrouter':
      return config.openrouter.model;
    case 'ollama':
      return config.ollama.model;
    case 'lmstudio':
      return config.lmstudio.model;
    case 'openclaw':
      return config.openclaw.model;
    case 'hermes':
      return config.hermes.model;
    default:
      return config.openai.model;
  }
}

function parseEmbeddingDimensions(env: NodeJS.ProcessEnv): number {
  const raw = getEnv(env, 'EMBEDDING_DIMENSIONS', '1536') ?? '1536';
  const dimensions = Number(raw);
  if (!Number.isInteger(dimensions) || dimensions <= 0) {
    throw new ConfigError(
      'EMBEDDING_DIMENSIONS must be a positive integer',
      'EMBEDDING_DIMENSIONS',
    );
  }
  return dimensions;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): KortexConfig {
  const aiProvider = (getEnv(env, 'AI_PROVIDER', 'openai') ?? 'openai') as AIProviderName;

  return {
    aiProvider,
    aiModel: getEnv(env, 'AI_MODEL'),
    memoryProvider: (getEnv(env, 'MEMORY_PROVIDER', 'none') ?? 'none') as MemoryProviderName,
    vectorProvider: (getEnv(env, 'VECTOR_PROVIDER', 'none') ?? 'none') as VectorProviderName,
    embeddingProvider: (getEnv(env, 'EMBEDDING_PROVIDER', 'openai') ??
      'openai') as EmbeddingProviderName,
    embeddingModel:
      getEnv(env, 'EMBEDDING_MODEL', 'text-embedding-3-small') ?? 'text-embedding-3-small',
    embeddingDimensions: parseEmbeddingDimensions(env),
    mcpEnabled: bool(env, 'MCP_ENABLED', false),
    openai: {
      apiKey: getEnv(env, 'OPENAI_API_KEY'),
      model: getEnv(env, 'OPENAI_MODEL', 'gpt-4o-mini') ?? 'gpt-4o-mini',
      baseUrl: getEnv(env, 'OPENAI_BASE_URL'),
    },
    anthropic: {
      apiKey: getEnv(env, 'ANTHROPIC_API_KEY'),
      model:
        getEnv(env, 'ANTHROPIC_MODEL', 'claude-3-5-sonnet-latest') ?? 'claude-3-5-sonnet-latest',
      baseUrl: getEnv(env, 'ANTHROPIC_BASE_URL'),
    },
    gemini: {
      apiKey: getEnv(env, 'GEMINI_API_KEY'),
      model: getEnv(env, 'GEMINI_MODEL', 'gemini-1.5-flash') ?? 'gemini-1.5-flash',
      baseUrl: getEnv(env, 'GEMINI_BASE_URL'),
    },
    openrouter: {
      apiKey: getEnv(env, 'OPENROUTER_API_KEY'),
      model: getEnv(env, 'OPENROUTER_MODEL', 'openai/gpt-4o-mini') ?? 'openai/gpt-4o-mini',
      baseUrl:
        getEnv(env, 'OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1') ??
        'https://openrouter.ai/api/v1',
    },
    ollama: {
      baseUrl: getEnv(env, 'OLLAMA_BASE_URL', 'http://localhost:11434') ?? 'http://localhost:11434',
      model: getEnv(env, 'OLLAMA_MODEL', 'llama3.2') ?? 'llama3.2',
    },
    lmstudio: {
      baseUrl: getEnv(env, 'LMSTUDIO_BASE_URL', 'http://localhost:1234') ?? 'http://localhost:1234',
      model: getEnv(env, 'LMSTUDIO_MODEL', 'local-model') ?? 'local-model',
    },
    openclaw: {
      baseUrl:
        getEnv(env, 'OPENCLAW_BASE_URL', 'http://localhost:18789') ?? 'http://localhost:18789',
      model: getEnv(env, 'OPENCLAW_MODEL', 'default') ?? 'default',
      token: getEnv(env, 'OPENCLAW_TOKEN'),
    },
    hermes: {
      baseUrl: getEnv(env, 'HERMES_BASE_URL', 'http://localhost:3000') ?? 'http://localhost:3000',
      model: getEnv(env, 'HERMES_MODEL', 'hermes') ?? 'hermes',
      token: getEnv(env, 'HERMES_TOKEN'),
    },
    database: { url: getEnv(env, 'DATABASE_URL') },
    redis: { url: getEnv(env, 'REDIS_URL', 'redis://localhost:6379') },
    qdrant: {
      url: getEnv(env, 'QDRANT_URL', 'http://localhost:6333'),
      apiKey: getEnv(env, 'QDRANT_API_KEY'),
    },
    logging: {
      level: (getEnv(env, 'LOG_LEVEL', 'info') ?? 'info') as KortexConfig['logging']['level'],
      debug: bool(env, 'KORTEX_DEBUG', false) || bool(env, 'DEBUG', false),
    },
  };
}

export function validateConfig(config: KortexConfig): void {
  switch (config.aiProvider) {
    case 'openai':
      if (!config.openai.apiKey)
        throw new ConfigError('OPENAI_API_KEY is required', 'OPENAI_API_KEY');
      break;
    case 'anthropic':
      if (!config.anthropic.apiKey)
        throw new ConfigError('ANTHROPIC_API_KEY is required', 'ANTHROPIC_API_KEY');
      break;
    case 'gemini':
      if (!config.gemini.apiKey)
        throw new ConfigError('GEMINI_API_KEY is required', 'GEMINI_API_KEY');
      break;
    case 'openrouter':
      if (!config.openrouter.apiKey)
        throw new ConfigError('OPENROUTER_API_KEY is required', 'OPENROUTER_API_KEY');
      break;
    case 'ollama':
    case 'lmstudio':
    case 'openclaw':
    case 'hermes':
      break;
    default:
      throw new ConfigError(`Unsupported AI_PROVIDER: ${config.aiProvider}`, 'AI_PROVIDER');
  }

  if (config.memoryProvider === 'postgres' && !config.database.url) {
    throw new ConfigError('DATABASE_URL is required when MEMORY_PROVIDER=postgres', 'DATABASE_URL');
  }
  if (config.memoryProvider === 'redis' && !config.redis.url) {
    throw new ConfigError('REDIS_URL is required when MEMORY_PROVIDER=redis', 'REDIS_URL');
  }
  if (config.vectorProvider === 'pgvector' && !config.database.url) {
    throw new ConfigError('DATABASE_URL is required when VECTOR_PROVIDER=pgvector', 'DATABASE_URL');
  }
  if (config.vectorProvider === 'pgvector') {
    if (!Number.isInteger(config.embeddingDimensions) || config.embeddingDimensions <= 0) {
      throw new ConfigError(
        'EMBEDDING_DIMENSIONS must be a positive integer when VECTOR_PROVIDER=pgvector',
        'EMBEDDING_DIMENSIONS',
      );
    }
  }
  if (config.vectorProvider === 'qdrant' && !config.qdrant.url) {
    throw new ConfigError('QDRANT_URL is required when VECTOR_PROVIDER=qdrant', 'QDRANT_URL');
  }
  if (config.embeddingProvider === 'openai' && !config.openai.apiKey) {
    throw new ConfigError(
      'OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai',
      'OPENAI_API_KEY',
    );
  }
}

export function loadDotenv(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require('dotenv');
    dotenv.config();
  } catch {
    // optional
  }
}
