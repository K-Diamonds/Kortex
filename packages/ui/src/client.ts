import type { KortexRequestBody, KortexResponse, KortexMessage } from './types.js';

export function createSessionIds(userId?: string, sessionId?: string) {
  const uid =
    userId ??
    (typeof localStorage !== 'undefined'
      ? (localStorage.getItem('kortex:userId') ??
        `user_${Math.random().toString(36).slice(2, 10)}`)
      : `user_${Date.now()}`);
  const sid =
    sessionId ??
    (typeof localStorage !== 'undefined'
      ? (localStorage.getItem('kortex:sessionId') ?? `session_${Date.now()}`)
      : `session_${Date.now()}`);

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('kortex:userId', uid);
    localStorage.setItem('kortex:sessionId', sid);
  }

  return { userId: uid, sessionId: sid };
}

export async function sendKortexMessage(options: {
  apiEndpoint: string;
  message: string;
  userId: string;
  sessionId: string;
  agentId?: string;
  memory?: boolean;
  rag?: boolean;
  tools?: boolean;
  stream?: boolean;
  metadata?: Record<string, unknown>;
  onChunk?: (content: string) => void;
  onContext?: (context: string[]) => void;
}): Promise<KortexResponse> {
  const body: KortexRequestBody = {
    message: options.message,
    userId: options.userId,
    sessionId: options.sessionId,
    agentId: options.agentId,
    memory: options.memory,
    rag: options.rag,
    tools: options.tools,
    stream: options.stream ?? true,
    metadata: options.metadata,
  };

  const response = await fetch(options.apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorBody.error ?? `Request failed (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (options.stream !== false && contentType.includes('text/event-stream') && response.body) {
    return readSseStream(response.body, options.onChunk, options.onContext);
  }

  const data = (await response.json()) as KortexResponse;
  return data;
}

async function readSseStream(
  body: ReadableStream<Uint8Array>,
  onChunk?: (content: string) => void,
  onContext?: (context: string[]) => void,
): Promise<KortexResponse> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let model: string | undefined;
  let context: string[] | undefined;
  let tools: string | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);
      try {
        const event = JSON.parse(payload) as {
          type: string;
          content?: string;
          error?: string;
          context?: string[];
          tools?: string;
          model?: string;
        };
        if (event.type === 'chunk' && event.content) {
          content += event.content;
          onChunk?.(event.content);
        }
        if (event.type === 'context' && event.context) {
          context = event.context;
          onContext?.(event.context);
        }
        if (event.type === 'tools' && event.tools) {
          tools = event.tools;
        }
        if (event.type === 'error') {
          throw new Error(event.error ?? 'Stream error');
        }
        if (event.model) model = event.model;
      } catch (error) {
        if (error instanceof Error && error.message !== 'Stream error') {
          // ignore malformed frames
        } else {
          throw error;
        }
      }
    }
  }

  return { content, model, context, tools };
}

export function toKortexMessage(role: 'user' | 'assistant', content: string): KortexMessage {
  return {
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}
