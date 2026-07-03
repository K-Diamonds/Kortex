import { describe, it, expect } from 'vitest';
import { PostgresMemoryProvider } from '../src/index.js';

describe('@kortex/postgres', () => {
  it('requires database url', () => {
    expect(() => new PostgresMemoryProvider({})).toThrow();
  });
});
