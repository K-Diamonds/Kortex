import type pg from 'pg';

export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;

export interface EnsureEmbeddingsTableOptions {
  dimensions?: number;
}

function assertValidDimensions(dimensions: number): void {
  if (!Number.isInteger(dimensions) || dimensions <= 0) {
    throw new Error(
      `Invalid embedding dimensions: ${dimensions}. EMBEDDING_DIMENSIONS must be a positive integer.`,
    );
  }
}

/** SQL for the embeddings table — dimensions must be chosen before first CREATE. */
export function embeddingsTableSql(dimensions: number): string {
  assertValidDimensions(dimensions);
  return `
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  session_id TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding vector(${dimensions}),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS embeddings_user_id_idx ON embeddings (user_id);
CREATE INDEX IF NOT EXISTS embeddings_session_id_idx ON embeddings (session_id);
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING hnsw (embedding vector_cosine_ops);

DROP TRIGGER IF EXISTS embeddings_set_updated_at ON embeddings;
CREATE TRIGGER embeddings_set_updated_at
  BEFORE UPDATE ON embeddings
  FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
`;
}

/** Returns pgvector column dimensions, or null if the embeddings table does not exist. */
export async function getEmbeddingsTableDimensions(
  client: pg.Pool | pg.PoolClient,
): Promise<number | null> {
  const exists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'embeddings'
     ) AS exists`,
  );

  if (!exists.rows[0]?.exists) {
    return null;
  }

  const result = await client.query<{ type: string }>(
    `SELECT format_type(a.atttypid, a.atttypmod) AS type
     FROM pg_attribute a
     INNER JOIN pg_class c ON c.oid = a.attrelid
     INNER JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'embeddings'
       AND a.attname = 'embedding'
       AND NOT a.attisdropped`,
  );

  const type = result.rows[0]?.type;
  const match = type?.match(/^vector\((\d+)\)$/);
  if (!match) {
    throw new Error(
      `Could not read embedding column type from embeddings table (got: ${type ?? 'unknown'})`,
    );
  }

  return Number(match[1]);
}

/**
 * Create the embeddings table when missing. Does not alter an existing table —
 * pgvector column dimensions cannot be migrated safely after data is stored.
 */
export async function ensureEmbeddingsTable(
  client: pg.Pool | pg.PoolClient,
  options: EnsureEmbeddingsTableOptions = {},
): Promise<void> {
  const dimensions = options.dimensions ?? DEFAULT_EMBEDDING_DIMENSIONS;
  assertValidDimensions(dimensions);

  const existing = await getEmbeddingsTableDimensions(client);
  if (existing !== null) {
    return;
  }

  await client.query(embeddingsTableSql(dimensions));
}

export function assertEmbeddingVectorLength(embedding: number[], expectedDimensions: number): void {
  if (embedding.length !== expectedDimensions) {
    throw new Error(
      `Embedding dimension mismatch: expected ${expectedDimensions}, got ${embedding.length}. ` +
        `Set EMBEDDING_DIMENSIONS=${embedding.length} before creating the embeddings table, ` +
        `or use an embedding model that outputs ${expectedDimensions} dimensions.`,
    );
  }
}

export function assertEmbeddingsSchemaDimensions(
  actualDimensions: number,
  expectedDimensions: number,
): void {
  if (actualDimensions !== expectedDimensions) {
    throw new Error(
      `embeddings table uses vector(${actualDimensions}) but EMBEDDING_DIMENSIONS=${expectedDimensions}. ` +
        'pgvector column dimensions cannot be changed safely after the table is created. ' +
        'Drop and recreate the embeddings table (and re-ingest vectors), or set EMBEDDING_DIMENSIONS to match the existing schema.',
    );
  }
}
