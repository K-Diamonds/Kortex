import type { EmbeddingProvider, EmbedDocumentOptions } from '@kortex/core';
import { HttpOpenAICompatibleProvider } from '@kortex/provider-shared';

export interface OllamaProviderConfig {
  baseUrl?: string;
  model?: string;
}

export class OllamaProvider extends HttpOpenAICompatibleProvider {
  private readonly ollamaBaseUrl: string;

  constructor(config: OllamaProviderConfig = {}) {
    const baseUrl = config.baseUrl ?? 'http://localhost:11434';
    super({
      name: 'ollama',
      baseUrl,
      model: config.model ?? 'llama3.2',
      paths: {
        chat: '/v1/chat/completions',
        embed: '/api/embeddings',
        models: '/api/tags',
      },
    });
    this.ollamaBaseUrl = baseUrl;
  }

  override async validateConfig(): Promise<void> {
    const response = await fetch(`${this.ollamaBaseUrl}/api/tags`);
    if (!response.ok) throw new Error(`Ollama validation failed: ${response.statusText}`);
  }
}

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'ollama-embed';
  constructor(
    private readonly config: { baseUrl: string; model: string },
  ) {}

  async embedText(text: string, options?: EmbedDocumentOptions): Promise<number[]> {
    const model = options?.model ?? this.config.model;
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text }),
    });
    if (!response.ok) throw new Error(`Ollama embed failed: ${response.statusText}`);
    const data = (await response.json()) as { embedding: number[] };
    return data.embedding;
  }

  async embedDocuments(texts: string[], options?: EmbedDocumentOptions): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embedText(text, options)));
  }
}
