import { describe, it, expect } from 'vitest';
import { HttpOpenAICompatibleProvider } from '../src/openai-compatible.js';

describe('HttpOpenAICompatibleProvider', () => {
  it('exposes provider name', () => {
    const provider = new HttpOpenAICompatibleProvider({
      name: 'test',
      baseUrl: 'http://localhost:1234',
      model: 'test-model',
    });
    expect(provider.name).toBe('test');
  });
});
