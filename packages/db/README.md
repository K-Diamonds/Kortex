# @kortex/db

PostgreSQL schema and migrations for Kortex.

## Tables

| Table | Purpose |
|-------|---------|
| `users` | App users (`external_id` for string IDs from clients) |
| `sessions` | Conversation sessions per user |
| `messages` | Chat message history |
| `memories` | Long-term memory entries |
| `documents` | RAG source documents |
| `document_chunks` | Chunked document text |
| `embeddings` | pgvector embeddings for similarity search |
| `tool_runs` | MCP / tool execution audit log |
| `agent_runs` | Agent execution audit log |

All tables use **UUID primary keys**, **`created_at` / `updated_at`** timestamps (with auto-update triggers), and **JSONB `metadata`** where useful.

## pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

The `embeddings` table includes an **HNSW cosine similarity index**:

```sql
CREATE INDEX embeddings_embedding_idx ON embeddings USING hnsw (embedding vector_cosine_ops);
```

## Apply migrations

### Drizzle (recommended for production)

```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kortex
pnpm db:migrate
```

### Raw SQL (idempotent bootstrap)

```bash
psql "$DATABASE_URL" -f packages/db/sql/001_initial_schema.sql
# or
pnpm db:schema
```

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
await ensureKortexSchema(pool);
```

Used by `@kortex/postgres` and `@kortex/pgvector` on first connection.
