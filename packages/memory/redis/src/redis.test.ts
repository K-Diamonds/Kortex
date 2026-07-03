import { describe, it, expect } from 'vitest';
import { RedisMemoryProvider } from '../src/index.js';

describe('RedisMemoryProvider', () => {
  it('requires url', () => {
    expect(() => new RedisMemoryProvider({ url: '' })).toThrow();
  });
});
