import { OpenAIProvider, type OpenAIProviderConfig } from './openai-provider.js';
import { OpenAIEmbeddingProvider } from './embedding-provider.js';

export { OpenAIProvider, type OpenAIProviderConfig };
export { OpenAIEmbeddingProvider };
export type {
  ChatOptions,
  ChatResponse,
  EmbedOptions,
  EmbedResponse,
  Message,
  StreamChunk,
} from '@kortex/core';

export interface CreateOpenAIProviderOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

/** @deprecated Prefer `new OpenAIProvider()` */
export function createOpenAIProvider(options: CreateOpenAIProviderOptions = {}): OpenAIProvider {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  return new OpenAIProvider({
    apiKey,
    model: options.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    baseUrl: options.baseUrl,
  });
}

export function createOpenAIProviderFromConfig(
  config: OpenAIProviderConfig,
): OpenAIProvider {
  return new OpenAIProvider(config);
}
