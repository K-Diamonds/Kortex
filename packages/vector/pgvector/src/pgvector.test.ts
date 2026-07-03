import { describe, it, expect } from 'vitest';
import { PgVectorProvider } from '../src/index.js';

describe('@kortex/pgvector', () => {
  it('requires database url', () => {
    expect(() => new PgVectorProvider({})).toThrow();
  });
});
