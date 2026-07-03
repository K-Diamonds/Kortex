import { describe, it, expect, vi } from 'vitest';
import { KortexAgent, KortexAgentProvider } from '../src/index.js';
import type { KortexRuntime } from '@kortex/core';

function createMockRuntime(): KortexRuntime {
  return {
    provider: { name: 'mock' },
    complete: vi.fn(async () => ({ content: 'ok', model: 'm' })),
    streamComplete: vi.fn(async function* () {
      yield { content: 'ok', done: true };
    }),
    searchMemory: vi.fn(async () => []),
    retrieveContext: vi.fn(async () => ({ chunks: [], query: '' })),
    getHistory: vi.fn(async () => []),
  } as unknown as KortexRuntime;
}

describe('@kortex/agents', () => {
  it('KortexAgent runs with system instructions', async () => {
    const runtime = createMockRuntime();
    const agent = new KortexAgent(runtime, {
      name: 'helper',
      instructions: 'You are helpful.',
      useMemory: false,
    });

    const response = await agent.run('Hello');
    expect(response.content).toBe('ok');
    expect(runtime.complete).toHaveBeenCalled();
  });

  it('KortexAgentProvider creates and runs agents', async () => {
    const runtime = createMockRuntime();
    const provider = new KortexAgentProvider(runtime);
    const agent = await provider.createAgent({
      name: 'researcher',
      instructions: 'Research topics.',
    });

    const response = await provider.runAgent(agent.id, 'topic');
    expect(response.content).toBe('ok');
  });
});
