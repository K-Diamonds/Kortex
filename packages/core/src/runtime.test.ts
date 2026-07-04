import { describe, it, expect, vi } from 'vitest';
import { KortexRuntime } from '../src/runtime.js';
import type {
  AIProvider,
  ChatResponse,
  MemoryEntry,
  MemoryProvider,
  StreamChunk,
  VectorProvider,
} from '../src/types.js';

function createMockProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    name: 'mock',
    chat: vi.fn(async (): Promise<ChatResponse> => ({
      content: 'Hello!',
      model: 'mock-model',
    })),
    stream: vi.fn(async function* (): AsyncIterable<StreamChunk> {
      yield { content: 'Hello', done: false };
      yield { content: '!', done: true, model: 'mock-model' };
    }),
    embed: vi.fn(async () => ({
      embeddings: [[0.1, 0.2, 0.3]],
      model: 'mock-embed',
      dimensions: 3,
    })),
    validateConfig: vi.fn(async () => {}),
    ...overrides,
  };
}

function createMockMemory(): MemoryProvider {
  return {
    name: 'mock-memory',
    saveMessage: vi.fn(async () => {}),
    getMessages: vi.fn(async () => []),
    saveMemory: vi.fn(async (entry) => ({
      ...entry,
      id: 'mem_1',
      createdAt: new Date(),
    })),
    searchMemory: vi.fn(async () => [
      {
        id: 'mem_1',
        userId: 'user_1',
        content: 'past fact',
        createdAt: new Date(),
      } satisfies MemoryEntry,
    ]),
    deleteMemory: vi.fn(async () => {}),
    clearSession: vi.fn(async () => {}),
  };
}

function createMockVector(): VectorProvider {
  return {
    name: 'mock-vector',
    createIndex: vi.fn(async () => {}),
    upsert: vi.fn(async (records) => records.map((r, i) => ({ ...r, id: `vec_${i}` }))),
    search: vi.fn(async () => [{ id: 'vec_0', content: 'Relevant doc', score: 0.9 }]),
    delete: vi.fn(async () => {}),
  };
}

describe('KortexRuntime MVP', () => {
  it('complete() delegates to AIProvider.chat()', async () => {
    const provider = createMockProvider();
    const runtime = new KortexRuntime({ provider });

    const response = await runtime.complete({
      messages: [{ role: 'user', content: 'Hi' }],
    });

    expect(response.content).toBe('Hello!');
    expect(provider.chat).toHaveBeenCalledOnce();
  });

  it('chat() orchestrates a user message', async () => {
    const provider = createMockProvider();
    const runtime = new KortexRuntime({ provider });

    const response = await runtime.chat({
      userId: 'user_1',
      sessionId: 'session_1',
      message: 'Hi',
      useMemory: false,
    });

    expect(response.content).toBe('Hello!');
  });

  it('remember() persists via MemoryProvider', async () => {
    const memory = createMockMemory();
    const runtime = new KortexRuntime({ provider: createMockProvider(), memory });

    const entry = await runtime.remember({
      userId: 'user_1',
      content: 'likes TypeScript',
    });

    expect(entry.id).toBe('mem_1');
    expect(memory.saveMemory).toHaveBeenCalled();
  });

  it('searchMemory() queries MemoryProvider', async () => {
    const memory = createMockMemory();
    const runtime = new KortexRuntime({ provider: createMockProvider(), memory });

    const results = await runtime.searchMemory({
      userId: 'user_1',
      query: 'TypeScript',
    });

    expect(results).toHaveLength(1);
    expect(memory.searchMemory).toHaveBeenCalled();
  });

  it('retrieveContext() embeds query and searches vector store', async () => {
    const provider = createMockProvider();
    const vector = createMockVector();
    const runtime = new KortexRuntime({ provider, vector });

    const context = await runtime.retrieveContext({ query: 'docs' });

    expect(provider.embed).toHaveBeenCalled();
    expect(vector.search).toHaveBeenCalled();
    expect(context.chunks[0]?.content).toBe('Relevant doc');
  });

  it('stream() yields chunks from provider', async () => {
    const provider = createMockProvider();
    const runtime = new KortexRuntime({ provider });

    const chunks: string[] = [];
    for await (const chunk of runtime.stream({
      userId: 'u1',
      sessionId: 's1',
      message: 'Hi',
      useMemory: false,
    })) {
      chunks.push(chunk.content);
    }

    expect(chunks.join('')).toBe('Hello!');
    expect(provider.stream).toHaveBeenCalled();
  });

  it('ingest() chunks documents and upserts vectors', async () => {
    const provider = createMockProvider();
    const vector = createMockVector();
    const runtime = new KortexRuntime({ provider, vector });

    const chunks = await runtime.ingest({
      documents: [{ content: 'Hello world from Kortex documentation.' }],
    });

    expect(chunks.length).toBeGreaterThan(0);
    expect(vector.upsert).toHaveBeenCalled();
  });

  it('runTool() executes registered tool provider', async () => {
    const runtime = new KortexRuntime({
      provider: createMockProvider(),
      tools: [
        {
          name: 'builtin',
          registerTool: () => {},
          listTools: async () => [{ name: 'echo', description: 'echo', parameters: {} }],
          executeTool: async (_name, args) => args,
        },
      ],
    });

    const result = await runtime.runTool('echo', { msg: 'hi' });
    expect(result).toEqual({ msg: 'hi' });
  });

  it('runAgent() delegates to AgentProvider', async () => {
    const runtime = new KortexRuntime({
      provider: createMockProvider(),
      agents: {
        name: 'test-agents',
        createAgent: vi.fn(),
        runAgent: vi.fn(async () => ({ content: 'agent reply', model: 'm' })),
      },
    });

    const response = await runtime.runAgent('agent-1', 'do task');
    expect(response.content).toBe('agent reply');
  });
});
