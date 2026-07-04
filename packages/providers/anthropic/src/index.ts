import type {
  AIProvider,
  ChatOptions,
  ChatResponse,
  EmbedOptions,
  EmbedResponse,
  Message,
  StreamChunk,
} from '@kortex/core';

export interface AnthropicProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

function toAnthropicMessages(messages: Message[]) {
  const system = messages.find((m) => m.role === 'system')?.content;
  const rest = messages.filter((m) => m.role !== 'system');
  return {
    system,
    messages: rest.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  };
}

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly baseUrl: string;

  constructor(config: AnthropicProviderConfig) {
    if (!config.apiKey?.trim()) throw new Error('ANTHROPIC_API_KEY is required');
    this.apiKey = config.apiKey;
    this.defaultModel = config.model ?? 'claude-3-5-sonnet-latest';
    this.baseUrl = (config.baseUrl ?? 'https://api.anthropic.com').replace(/\/$/, '');
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  async validateConfig(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model: this.defaultModel,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });
    if (response.status === 401) throw new Error('Anthropic API key invalid');
    if (!response.ok && response.status !== 400) {
      throw new Error(`Anthropic validation failed: ${await readError(response)}`);
    }
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    const model = options.model ?? this.defaultModel;
    const { system, messages } = toAnthropicMessages(options.messages);
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model,
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature,
        system,
        messages,
      }),
    });
    if (!response.ok) throw new Error(`Anthropic chat failed: ${await readError(response)}`);
    const data = (await response.json()) as {
      content: Array<{ text: string }>;
      model: string;
      usage?: { input_tokens: number; output_tokens: number };
      stop_reason?: string;
    };
    return {
      content: data.content.map((c) => c.text).join(''),
      model: data.model ?? model,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
      finishReason: data.stop_reason,
    };
  }

  async *stream(options: ChatOptions): AsyncIterable<StreamChunk> {
    const model = options.model ?? this.defaultModel;
    const { system, messages } = toAnthropicMessages(options.messages);
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model,
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature,
        system,
        messages,
        stream: true,
      }),
    });
    if (!response.ok) throw new Error(`Anthropic stream failed: ${await readError(response)}`);
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Anthropic stream empty body');
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6)) as {
            type: string;
            delta?: { text?: string };
          };
          if (event.type === 'content_block_delta' && event.delta?.text) {
            yield { content: event.delta.text, done: false, model };
          }
          if (event.type === 'message_stop') {
            yield { content: '', done: true, model };
          }
        } catch {
          // skip
        }
      }
    }
    yield { content: '', done: true, model };
  }

  async embed(_options: EmbedOptions): Promise<EmbedResponse> {
    throw new Error('Anthropic does not provide embeddings; set EMBEDDING_PROVIDER=openai');
  }
}

export { AnthropicProvider as default };
