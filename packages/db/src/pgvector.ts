import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';
import {
  assertEmbeddingsSchemaDimensions,
  DEFAULT_EMBEDDING_DIMENSIONS,
  ensureEmbeddingsTable,
  getEmbeddingsTableDimensions,
} from './embeddings-schema.js';

const sqlDir = resolve(dirname(fileURLToPath(import.meta.url)), '../sql/001_initial_schema.sql');

/** Full Kortex schema SQL (idempotent) — extension, tables, indexes, triggers. */
export const kortexSchemaSql = readFileSync(sqlDir, 'utf-8');

/** @deprecated Use `kortexSchemaSql` */
export const pgvectorSql = kortexSchemaSql;

export interface EnsureKortexSchemaOptions {
  /** pgvector column size for the embeddings table. Default: 1536. Set before first bootstrap. */
  embeddingDimensions?: number;
}

/** Apply the full Kortex PostgreSQL schema (pgvector, memory, RAG tables). */
export async function ensureKortexSchema(
  client: pg.Pool | pg.PoolClient,
  options: EnsureKortexSchemaOptions = {},
): Promise<void> {
  const embeddingDimensions = options.embeddingDimensions ?? DEFAULT_EMBEDDING_DIMENSIONS;
  await client.query(kortexSchemaSql);
  await ensureEmbeddingsTable(client, { dimensions: embeddingDimensions });

  const actualDimensions = await getEmbeddingsTableDimensions(client);
  if (actualDimensions !== null) {
    assertEmbeddingsSchemaDimensions(actualDimensions, embeddingDimensions);
  }
}

/** @deprecated Use `ensureKortexSchema` */
export async function ensurePgVector(
  client: pg.Pool | pg.PoolClient,
  options: EnsureKortexSchemaOptions = {},
): Promise<void> {
  await ensureKortexSchema(client, options);
}

export {
  assertEmbeddingVectorLength,
  assertEmbeddingsSchemaDimensions,
  DEFAULT_EMBEDDING_DIMENSIONS,
  embeddingsTableSql,
  ensureEmbeddingsTable,
  getEmbeddingsTableDimensions,
} from './embeddings-schema.js';
