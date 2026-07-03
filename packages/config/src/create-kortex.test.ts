import { describe, it, expect, vi } from 'vitest';
import { createKortex } from './create-kortex.js';

describe('createKortex', () => {
  it('creates runtime with injected provider', async () => {
    const provider = {
      name: 'mock',
      chat: vi.fn(async () => ({ content: 'ok', model: 'mock' })),
      stream: vi.fn(async function* () {
        yield { content: 'ok', done: true };
      }),
      embed: vi.fn(async () => ({ embeddings: [[]], model: 'mock', dimensions: 0 })),
      validateConfig: vi.fn(async () => {}),
    };

    const runtime = await createKortex({ provider });
    const response = await runtime.chat({
      userId: 'u1',
      sessionId: 's1',
      message: 'hello',
      useMemory: false,
    });

    expect(response.content).toBe('ok');
  });
});
