import { config as loadEnv } from 'dotenv';
import pg from 'pg';
import { DEFAULT_EMBEDDING_DIMENSIONS, ensureKortexSchema } from '../src/pgvector.js';

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const rawDimensions = process.env.EMBEDDING_DIMENSIONS ?? String(DEFAULT_EMBEDDING_DIMENSIONS);
const embeddingDimensions = Number(rawDimensions);
if (!Number.isInteger(embeddingDimensions) || embeddingDimensions <= 0) {
  console.error('EMBEDDING_DIMENSIONS must be a positive integer');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

try {
  await ensureKortexSchema(pool, { embeddingDimensions });
  console.log(`Kortex schema applied (embedding dimensions: ${embeddingDimensions})`);
} finally {
  await pool.end();
}
