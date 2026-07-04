import type {
  AIProvider,
  ChatOptions,
  ChatResponse,
  EmbedOptions,
  EmbedResponse,
  Message,
  StreamChunk,
} from '@kortex/core';

export interface GeminiProviderConfig {
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

function toGeminiContents(messages: Message[]) {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly baseUrl: string;

  constructor(config: GeminiProviderConfig) {
    if (!config.apiKey?.trim()) throw new Error('GEMINI_API_KEY is required');
    this.apiKey = config.apiKey;
    this.defaultModel = config.model ?? 'gemini-1.5-flash';
    this.baseUrl = (config.baseUrl ?? 'https://generativelanguage.googleapis.com').replace(
      /\/$/,
      '',
    );
  }

  private modelUrl(model: string, action: string): string {
    return `${this.baseUrl}/v1beta/models/${model}:${action}?key=${this.apiKey}`;
  }

  async validateConfig(): Promise<void> {
    const response = await fetch(this.modelUrl(this.defaultModel, 'generateContent'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'ping' }] }] }),
    });
    if (response.status === 401 || response.status === 403)
      throw new Error('Gemini API key invalid');
    if (!response.ok && response.status !== 400) {
      throw new Error(`Gemini validation failed: ${await readError(response)}`);
    }
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    const model = options.model ?? this.defaultModel;
    const system = options.messages.find((m) => m.role === 'system')?.content;
    const contents = toGeminiContents(options.messages);
    const response = await fetch(this.modelUrl(model, 'generateContent'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens,
        },
      }),
    });
    if (!response.ok) throw new Error(`Gemini chat failed: ${await readError(response)}`);
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    const usage = data.usageMetadata;
    return {
      content: text,
      model,
      usage: usage
        ? {
            promptTokens: usage.promptTokenCount ?? 0,
            completionTokens: usage.candidatesTokenCount ?? 0,
            totalTokens: usage.totalTokenCount ?? 0,
          }
        : undefined,
      finishReason: data.candidates?.[0]?.finishReason,
    };
  }

  async *stream(options: ChatOptions): AsyncIterable<StreamChunk> {
    const model = options.model ?? this.defaultModel;
    const system = options.messages.find((m) => m.role === 'system')?.content;
    const contents = toGeminiContents(options.messages);
    const response = await fetch(this.modelUrl(model, 'streamGenerateContent') + '&alt=sse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
      }),
    });
    if (!response.ok) throw new Error(`Gemini stream failed: ${await readError(response)}`);
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Gemini stream empty body');
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
          const data = JSON.parse(line.slice(6)) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          if (text) yield { content: text, done: false, model };
        } catch {
          // skip
        }
      }
    }
    yield { content: '', done: true, model };
  }

  async embed(options: EmbedOptions): Promise<EmbedResponse> {
    const model = options.model ?? 'text-embedding-004';
    const texts = Array.isArray(options.input) ? options.input : [options.input];
    const embeddings: number[][] = [];
    for (const text of texts) {
      const response = await fetch(this.modelUrl(model, 'embedContent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: { parts: [{ text }] } }),
      });
      if (!response.ok) throw new Error(`Gemini embed failed: ${await readError(response)}`);
      const data = (await response.json()) as { embedding?: { values?: number[] } };
      embeddings.push(data.embedding?.values ?? []);
    }
    return { embeddings, model, dimensions: embeddings[0]?.length ?? 0 };
  }
}
