import { describe, it, expect, vi } from 'vitest';
import type { AIProvider, ChatResponse, StreamChunk } from '@kortex/core';
import { createKortexFromEnv } from './factory.js';

function createMockProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    name: 'mock',
    chat: vi.fn(async (): Promise<ChatResponse> => ({ content: 'Hello!', model: 'mock-model' })),
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

describe('createKortexFromEnv', () => {
  it('accepts injected provider (DI)', async () => {
    const provider = createMockProvider({ name: 'openai' });
    const runtime = await createKortexFromEnv({
      env: { AI_PROVIDER: 'openai', OPENAI_API_KEY: 'sk-test' } as NodeJS.ProcessEnv,
      provider,
    });
    expect(runtime.provider.name).toBe('openai');
    expect(provider.validateConfig).toHaveBeenCalled();
  });

  it('rejects missing OPENAI_API_KEY', async () => {
    await expect(
      createKortexFromEnv({ env: { AI_PROVIDER: 'openai' } as NodeJS.ProcessEnv }),
    ).rejects.toThrow('OPENAI_API_KEY');
  });
});
