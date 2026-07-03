import { describe, it, expect } from 'vitest';
import { PgVectorProvider } from '../src/index.js';

describe('@kortex/pgvector', () => {
  it('requires database url', () => {
    expect(() => new PgVectorProvider({})).toThrow();
  });

  it('defaults dimensions to 1536', () => {
    const provider = new PgVectorProvider({ databaseUrl: 'postgresql://localhost/test' });
    expect((provider as unknown as { dimensions: number }).dimensions).toBe(1536);
  });

  it('rejects invalid dimensions', () => {
    expect(
      () => new PgVectorProvider({ databaseUrl: 'postgresql://localhost/test', dimensions: 0 }),
    ).toThrow('Invalid pgvector dimensions');
  });
});
