import type { EmbeddingProvider, EmbedDocumentOptions } from '@kortex/core';
import { OpenAIProvider, type OpenAIProviderConfig } from './openai-provider.js';

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai-embed';
  private readonly provider: OpenAIProvider;
  private readonly defaultModel: string;

  constructor(config: OpenAIProviderConfig & { model?: string }) {
    this.provider = new OpenAIProvider(config);
    this.defaultModel = config.model ?? 'text-embedding-3-small';
  }

  async embedText(text: string, options?: EmbedDocumentOptions): Promise<number[]> {
    const result = await this.provider.embed({
      input: text,
      model: options?.model ?? this.defaultModel,
    });
    return result.embeddings[0] ?? [];
  }

  async embedDocuments(texts: string[], options?: EmbedDocumentOptions): Promise<number[][]> {
    const result = await this.provider.embed({
      input: texts,
      model: options?.model ?? this.defaultModel,
    });
    return result.embeddings;
  }
}
