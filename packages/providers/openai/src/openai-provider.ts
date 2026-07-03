import type { AIProvider, ChatOptions, ChatResponse, EmbedOptions, EmbedResponse, Message, StreamChunk } from '@kortex/core';
import type { EmbeddingProvider, EmbedDocumentOptions } from '@kortex/core';

export interface OpenAIProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

interface OpenAIChatResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string | null };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function readApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

function toApiMessages(messages: Message[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';

  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly baseUrl: string;

  constructor(config: OpenAIProviderConfig) {
    if (!config.apiKey?.trim()) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.apiKey = config.apiKey;
    this.defaultModel = config.model ?? 'gpt-4o-mini';
    this.baseUrl = (config.baseUrl ?? 'https://api.openai.com/v1').replace(/\/$/, '');
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async validateConfig(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`OpenAI config validation failed: ${await readApiError(response)}`);
    }
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    const model = options.model ?? this.defaultModel;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model,
        messages: toApiMessages(options.messages),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI chat failed: ${await readApiError(response)}`);
    }

    const data = (await response.json()) as OpenAIChatResponse;
    const choice = data.choices[0];

    return {
      content: choice?.message.content ?? '',
      model: data.model ?? model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      finishReason: choice?.finish_reason,
    };
  }

  async *stream(options: ChatOptions): AsyncIterable<StreamChunk> {
    const model = options.model ?? this.defaultModel;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model,
        messages: toApiMessages(options.messages),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI stream failed: ${await readApiError(response)}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('OpenAI stream failed: empty response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        const payload = trimmed.slice(6);
        if (payload === '[DONE]') {
          yield { content: '', done: true, model };
          return;
        }

        try {
          const parsed = JSON.parse(payload) as {
            choices: Array<{ delta: { content?: string }; finish_reason: string | null }>;
          };
          const content = parsed.choices[0]?.delta.content ?? '';
          const finished = parsed.choices[0]?.finish_reason !== null;
          if (content || finished) {
            yield { content, done: finished, model };
          }
        } catch {
          // ignore malformed SSE frames
        }
      }
    }

    yield { content: '', done: true, model };
  }

  async embed(options: EmbedOptions): Promise<EmbedResponse> {
    const model = options.model ?? 'text-embedding-3-small';
    const input = Array.isArray(options.input) ? options.input : [options.input];

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ model, input }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI embed failed: ${await readApiError(response)}`);
    }

    const data = (await response.json()) as {
      data: Array<{ embedding: number[] }>;
      model: string;
    };

    const embeddings = data.data.map((row) => row.embedding);
    return {
      embeddings,
      model: data.model ?? model,
      dimensions: embeddings[0]?.length ?? 0,
    };
  }
}
