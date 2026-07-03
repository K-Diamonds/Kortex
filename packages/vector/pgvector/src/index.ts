import { randomUUID } from 'node:crypto';
import { ensureKortexSchema } from '@kortex/db';
import type {
  VectorIndexOptions,
  VectorProvider,
  VectorRecord,
  VectorSearchOptions,
  VectorSearchResult,
} from '@kortex/core';
import pg from 'pg';

export interface PgVectorOptions {
  connectionString?: string;
  databaseUrl?: string;
  dimensions?: number;
}

export class PgVectorProvider implements VectorProvider {
  readonly name = 'pgvector';
  private readonly pool: pg.Pool;
  private readonly dimensions?: number;
  private indexReady: Promise<void> | null = null;

  constructor(options: PgVectorOptions) {
    const connectionString = options.databaseUrl ?? options.connectionString;
    if (!connectionString) {
      throw new Error('PgVectorProvider requires connectionString or databaseUrl');
    }
    this.pool = new pg.Pool({ connectionString });
    this.dimensions = options.dimensions;
  }

  async createIndex(_options?: VectorIndexOptions): Promise<void> {
    this.indexReady ??= ensureKortexSchema(this.pool).then(() => undefined);
    return this.indexReady;
  }

  async upsert(records: Omit<VectorRecord, 'id'>[]): Promise<VectorRecord[]> {
    await this.createIndex();
    const results: VectorRecord[] = [];

    for (const record of records) {
      const id = randomUUID();
      const vectorStr = `[${record.embedding.join(',')}]`;

      await this.pool.query(
        `INSERT INTO embeddings (id, content, embedding, metadata, user_id, session_id)
         VALUES ($1, $2, $3::vector, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           content = EXCLUDED.content,
           embedding = EXCLUDED.embedding,
           metadata = EXCLUDED.metadata,
           user_id = EXCLUDED.user_id,
           session_id = EXCLUDED.session_id`,
        [
          id,
          record.content,
          vectorStr,
          record.metadata ?? null,
          record.userId ?? null,
          record.sessionId ?? null,
        ],
      );

      results.push({ ...record, id });
    }

    return results;
  }

  async search(options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    await this.createIndex();
    const limit = options.limit ?? 5;
    const vectorStr = `[${options.embedding.join(',')}]`;
    const minScore = options.minScore ?? 0;

    let query = `
      SELECT id, content, metadata,
             1 - (embedding <=> $1::vector) AS score
      FROM embeddings
      WHERE embedding IS NOT NULL`;
    const params: unknown[] = [vectorStr];
    let paramIdx = 2;

    if (options.userId) {
      query += ` AND user_id = $${paramIdx}`;
      params.push(options.userId);
      paramIdx++;
    }

    if (options.sessionId) {
      query += ` AND session_id = $${paramIdx}`;
      params.push(options.sessionId);
      paramIdx++;
    }

    query += ` ORDER BY embedding <=> $1::vector LIMIT $${paramIdx}`;
    params.push(limit);

    const result = await this.pool.query(query, params);

    return result.rows
      .filter((row) => row.score >= minScore)
      .map((row) => ({
        id: row.id,
        content: row.content,
        score: row.score,
        metadata: row.metadata,
      }));
  }

  async delete(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.createIndex();
    await this.pool.query(`DELETE FROM embeddings WHERE id = ANY($1)`, [ids]);
  }
}

/** @deprecated Use `new PgVectorProvider()` */
export function createPgVectorProvider(options: PgVectorOptions): PgVectorProvider {
  return new PgVectorProvider(options);
}
