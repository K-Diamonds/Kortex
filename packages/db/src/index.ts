import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

export type KortexDatabase = NodePgDatabase<typeof schema>;

export interface CreateDbOptions {
  connectionString: string;
  pool?: pg.Pool;
}

export function createDb(options: CreateDbOptions): KortexDatabase {
  const pool = options.pool ?? new pg.Pool({ connectionString: options.connectionString });
  return drizzle(pool, { schema });
}

export async function createDbFromEnv(): Promise<KortexDatabase> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }
  return createDb({ connectionString });
}

export { schema };
export * from './schema.js';
export { ensureKortexSchema, ensurePgVector, kortexSchemaSql, pgvectorSql } from './pgvector.js';
export {
  assertEmbeddingVectorLength,
  assertEmbeddingsSchemaDimensions,
  DEFAULT_EMBEDDING_DIMENSIONS,
  embeddingsTableSql,
  ensureEmbeddingsTable,
  getEmbeddingsTableDimensions,
  type EnsureEmbeddingsTableOptions,
} from './embeddings-schema.js';
export type { EnsureKortexSchemaOptions } from './pgvector.js';
