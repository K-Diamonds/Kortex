import type {
  AIProvider,
  ChatOptions,
  ChatResponse,
  EmbedOptions,
  EmbedResponse,
  Message,
  StreamChunk,
} from './types.js';

export interface HttpProviderPaths {
  chat?: string;
  embed?: string;
  models?: string;
}

export interface HttpOpenAICompatibleConfig {
  name: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
  token?: string;
  paths?: HttpProviderPaths;
  authHeader?: string;
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
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

export class HttpOpenAICompatibleProvider implements AIProvider {
  readonly name: string;
  protected readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly apiKey?: string;
  private readonly token?: string;
  private readonly paths: Required<HttpProviderPaths>;
  private readonly authHeader: string;

  constructor(config: HttpOpenAICompatibleConfig) {
    this.name = config.name;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.defaultModel = config.model;
    this.apiKey = config.apiKey;
    this.token = config.token;
    this.paths = {
      chat: config.paths?.chat ?? '/v1/chat/completions',
      embed: config.paths?.embed ?? '/v1/embeddings',
      models: config.paths?.models ?? '/v1/models',
    };
    this.authHeader = config.authHeader ?? 'Authorization';
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const secret = this.apiKey ?? this.token;
    if (secret) {
      headers[this.authHeader] =
        this.authHeader.toLowerCase() === 'authorization' ? `Bearer ${secret}` : secret;
    }
    return headers;
  }

  private url(path: string): string {
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  async validateConfig(): Promise<void> {
    const response = await fetch(this.url(this.paths.models), { headers: this.headers() });
    if (!response.ok) {
      throw new Error(`${this.name} config validation failed: ${await readApiError(response)}`);
    }
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    const model = options.model ?? this.defaultModel;
    const response = await fetch(this.url(this.paths.chat), {
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
      throw new Error(`${this.name} chat failed: ${await readApiError(response)}`);
    }

    const data = (await response.json()) as {
      model?: string;
      choices: Array<{ message: { content: string | null }; finish_reason?: string }>;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

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
    const response = await fetch(this.url(this.paths.chat), {
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
      throw new Error(`${this.name} stream failed: ${await readApiError(response)}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error(`${this.name} stream failed: empty body`);

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
          if (content || finished) yield { content, done: finished, model };
        } catch {
          // skip malformed SSE
        }
      }
    }
    yield { content: '', done: true, model };
  }

  async embed(options: EmbedOptions): Promise<EmbedResponse> {
    const model = options.model ?? 'text-embedding-3-small';
    const input = Array.isArray(options.input) ? options.input : [options.input];
    const response = await fetch(this.url(this.paths.embed), {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ model, input }),
    });

    if (!response.ok) {
      throw new Error(`${this.name} embed failed: ${await readApiError(response)}`);
    }

    const data = (await response.json()) as { data: Array<{ embedding: number[] }>; model?: string };
    const embeddings = data.data.map((row) => row.embedding);
    return { embeddings, model: data.model ?? model, dimensions: embeddings[0]?.length ?? 0 };
  }
}
