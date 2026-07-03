import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';

const sqlDir = resolve(dirname(fileURLToPath(import.meta.url)), '../sql/001_initial_schema.sql');

/** Full Kortex schema SQL (idempotent) — extension, tables, indexes, triggers. */
export const kortexSchemaSql = readFileSync(sqlDir, 'utf-8');

/** @deprecated Use `kortexSchemaSql` */
export const pgvectorSql = kortexSchemaSql;

/** Apply the full Kortex PostgreSQL schema (pgvector, memory, RAG tables). */
export async function ensureKortexSchema(client: pg.Pool | pg.PoolClient): Promise<void> {
  await client.query(kortexSchemaSql);
}

/** @deprecated Use `ensureKortexSchema` */
export async function ensurePgVector(client: pg.Pool | pg.PoolClient): Promise<void> {
  await ensureKortexSchema(client);
}
