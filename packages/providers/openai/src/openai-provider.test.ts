import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIProvider } from './openai-provider.js';

describe('OpenAIProvider', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('requires an API key', () => {
    expect(() => new OpenAIProvider({ apiKey: '' })).toThrow('OPENAI_API_KEY');
  });

  it('validateConfig() checks the models endpoint', async () => {
    globalThis.fetch = vi.fn(
      async () => new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );

    const provider = new OpenAIProvider({ apiKey: 'sk-test' });
    await expect(provider.validateConfig()).resolves.toBeUndefined();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/models',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer sk-test' }),
      }),
    );
  });

  it('chat() returns assistant content', async () => {
    globalThis.fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            model: 'gpt-4o-mini',
            choices: [
              { message: { role: 'assistant', content: 'Hi there' }, finish_reason: 'stop' },
            ],
          }),
          { status: 200 },
        ),
    );

    const provider = new OpenAIProvider({ apiKey: 'sk-test' });
    const response = await provider.chat({
      messages: [{ role: 'user', content: 'Hello' }],
    });

    expect(response.content).toBe('Hi there');
    expect(response.model).toBe('gpt-4o-mini');
  });
});
