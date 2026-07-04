# @kortex/db

PostgreSQL schema and migrations for Kortex.

## Tables

| Table             | Purpose                                               |
| ----------------- | ----------------------------------------------------- |
| `users`           | App users (`external_id` for string IDs from clients) |
| `sessions`        | Conversation sessions per user                        |
| `messages`        | Chat message history                                  |
| `memories`        | Long-term memory entries                              |
| `documents`       | RAG source documents                                  |
| `document_chunks` | Chunked document text                                 |
| `embeddings`      | pgvector embeddings for similarity search             |
| `tool_runs`       | MCP / tool execution audit log                        |
| `agent_runs`      | Agent execution audit log                             |

All tables use **UUID primary keys**, **`created_at` / `updated_at`** timestamps (with auto-update triggers), and **JSONB `metadata`** where useful.

## pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

The `embeddings` table stores vectors with a configurable column size:

```env
EMBEDDING_DIMENSIONS=1536   # default; must match your embedding model output
```

Example column definition (created by `ensureKortexSchema`):

```sql
embedding vector(1536)
```

An **HNSW cosine similarity index** is created on first bootstrap:

```sql
CREATE INDEX embeddings_embedding_idx ON embeddings USING hnsw (embedding vector_cosine_ops);
```

### Choosing dimensions before bootstrap

**pgvector column dimensions cannot be changed safely after the `embeddings` table is created.** Existing vectors would need to be dropped and re-ingested.

1. Pick `EMBEDDING_DIMENSIONS` to match your embedding model (default `1536` for `text-embedding-3-small`).
2. Set it in `.env` **before** running `pnpm db:schema` or before the first `PgVectorProvider` connection.
3. If you already created the table with the wrong size, drop `embeddings` (and re-ingest data) or align `EMBEDDING_DIMENSIONS` with the existing `vector(N)` column.

`pnpm db:migrate` (Drizzle) ships with `vector(1536)` in the initial migration. For non-default dimensions, prefer `pnpm db:schema`, which reads `EMBEDDING_DIMENSIONS` from the environment.

## Apply migrations

### Environment-aware bootstrap (recommended for pgvector)

```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kortex
export EMBEDDING_DIMENSIONS=1536   # set before first run if not using default
pnpm db:schema
```

This runs `ensureKortexSchema()` and creates the `embeddings` table with your configured dimensions.

### Drizzle (tracked migrations)

```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kortex
pnpm db:migrate
```

The bundled initial migration uses `vector(1536)`. Use a fresh database and custom dimensions only via `pnpm db:schema` unless you author a new migration.

### Raw SQL (base tables only)

```bash
psql "$DATABASE_URL" -f packages/db/sql/001_initial_schema.sql
```

The SQL file creates all tables **except** `embeddings`. Create embeddings via `pnpm db:schema` or `ensureKortexSchema(pool, { embeddingDimensions })`.

### Dev sync

```bash
pnpm db:push    # drizzle-kit push
pnpm db:studio  # browse tables
```

## Programmatic bootstrap

```typescript
import { ensureKortexSchema } from '@kortex/db';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await ensureKortexSchema(pool, {
  embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 1536),
});
```

Used by `@kortex/postgres` and `@kortex/pgvector` on first connection.
