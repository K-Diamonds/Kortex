import { describe, it, expect } from 'vitest';
import {
  assertEmbeddingVectorLength,
  assertEmbeddingsSchemaDimensions,
  embeddingsTableSql,
} from './embeddings-schema.js';

describe('embeddings-schema', () => {
  it('generates SQL with configured dimensions', () => {
    const sql = embeddingsTableSql(3072);
    expect(sql).toContain('vector(3072)');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS embeddings');
  });

  it('defaults to 1536 in generated SQL when using default constant', () => {
    expect(embeddingsTableSql(1536)).toContain('vector(1536)');
  });

  it('rejects invalid dimensions in SQL generation', () => {
    expect(() => embeddingsTableSql(0)).toThrow('Invalid embedding dimensions');
    expect(() => embeddingsTableSql(1.5)).toThrow('Invalid embedding dimensions');
  });

  it('assertEmbeddingVectorLength throws on mismatch', () => {
    expect(() => assertEmbeddingVectorLength([1, 2, 3], 1536)).toThrow(
      'Embedding dimension mismatch',
    );
    expect(() => assertEmbeddingVectorLength(new Array(1536).fill(0), 1536)).not.toThrow();
  });

  it('assertEmbeddingsSchemaDimensions throws on schema mismatch', () => {
    expect(() => assertEmbeddingsSchemaDimensions(1536, 3072)).toThrow(
      'pgvector column dimensions cannot be changed safely',
    );
    expect(() => assertEmbeddingsSchemaDimensions(1536, 1536)).not.toThrow();
  });
});
