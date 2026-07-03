-- Kortex initial PostgreSQL schema
-- Apply: psql "$DATABASE_URL" -f packages/db/sql/001_initial_schema.sql
-- Or:    pnpm db:migrate

CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION kortex_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  email TEXT,
  name TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_external_id_idx ON users (external_id);

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();

-- ---------------------------------------------------------------------------
-- sessions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  external_id TEXT,
  title TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sessions_user_external_id_unique UNIQUE (user_id, external_id)
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);

DROP TRIGGER IF EXISTS sessions_set_updated_at ON sessions;
CREATE TRIGGER sessions_set_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages (user_id);
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages (session_id);

DROP TRIGGER IF EXISTS messages_set_updated_at ON messages;
CREATE TRIGGER messages_set_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();

-- ---------------------------------------------------------------------------
-- memories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions (id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS memories_user_id_idx ON memories (user_id);
CREATE INDEX IF NOT EXISTS memories_session_id_idx ON memories (session_id);

DROP TRIGGER IF EXISTS memories_set_updated_at ON memories;
CREATE TRIGGER memories_set_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT,
  source TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents (user_id);

DROP TRIGGER IF EXISTS documents_set_updated_at ON documents;
CREATE TRIGGER documents_set_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();

-- ---------------------------------------------------------------------------
-- document_chunks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks (document_id);
CREATE INDEX IF NOT EXISTS document_chunks_chunk_index_idx ON document_chunks (document_id, chunk_index);

DROP TRIGGER IF EXISTS document_chunks_set_updated_at ON document_chunks;
CREATE TRIGGER document_chunks_set_updated_at
  BEFORE UPDATE ON document_chunks
  FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();

-- ---------------------------------------------------------------------------
-- embeddings (pgvector)
-- Created programmatically via ensureKortexSchema({ embeddingDimensions })
-- so EMBEDDING_DIMENSIONS can be set before first bootstrap. Default: 1536.
-- Do not add CREATE TABLE embeddings here — see packages/db/src/embeddings-schema.ts
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- tool_runs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tool_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions (id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tool_runs_user_id_idx ON tool_runs (user_id);
CREATE INDEX IF NOT EXISTS tool_runs_session_id_idx ON tool_runs (session_id);
CREATE INDEX IF NOT EXISTS tool_runs_tool_name_idx ON tool_runs (tool_name);

DROP TRIGGER IF EXISTS tool_runs_set_updated_at ON tool_runs;
CREATE TRIGGER tool_runs_set_updated_at
  BEFORE UPDATE ON tool_runs
  FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();

-- ---------------------------------------------------------------------------
-- agent_runs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions (id) ON DELETE SET NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_runs_user_id_idx ON agent_runs (user_id);
CREATE INDEX IF NOT EXISTS agent_runs_session_id_idx ON agent_runs (session_id);
CREATE INDEX IF NOT EXISTS agent_runs_agent_id_idx ON agent_runs (agent_id);

DROP TRIGGER IF EXISTS agent_runs_set_updated_at ON agent_runs;
CREATE TRIGGER agent_runs_set_updated_at
  BEFORE UPDATE ON agent_runs
  FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
