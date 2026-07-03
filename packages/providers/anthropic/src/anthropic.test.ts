import { describe, it, expect } from 'vitest';
import { AnthropicProvider } from '../src/index.js';

describe('@kortex/anthropic', () => {
  it('exposes provider name', () => {
    const provider = new AnthropicProvider({ apiKey: 'sk-test' });
    expect(provider.name).toBe('anthropic');
  });
});
