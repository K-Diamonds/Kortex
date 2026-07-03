# Kortex

**An open-source AI Runtime Framework for building production chatbots, agents, RAG pipelines, and memory-backed applications — with swappable LLM providers and zero vendor lock-in.**

Kortex is not a chatbot. It is the runtime layer underneath one: a TypeScript framework that unifies chat, streaming, embeddings, conversation memory, vector retrieval, tools, and agents behind a single, testable API.

You bring your own models, databases, and infrastructure. Kortex wires them together — in the cloud, on-prem, at the edge, or in your own product.

> **Kortex v1.0** — Multi-LLM · Memory · Vector · RAG · MCP · Agents · Docker · Docs (`pnpm docs`)

---

## Why Kortex Exists

Production AI applications rarely fail on prompt quality alone. They fail on **integration surface area**:

- Every LLM vendor exposes a different API, error model, and streaming protocol.
- Memory, vectors, tools, and agents each arrive as separate SDKs with incompatible abstractions.
- Teams hardcode a single vendor + vector store + custom glue code, then cannot swap components without a rewrite.

Kortex addresses this with a **provider-agnostic runtime** built on clean architecture:

| Problem | Kortex approach |
|---------|-----------------|
| LLM vendor coupling | `AIProvider` interface — swap via config or dependency injection |
| Stateful conversations | `MemoryProvider` — PostgreSQL, Redis, or your own adapter |
| RAG retrieval | `VectorProvider` — pgvector, Qdrant, or your own adapter |
| Operational complexity | One `KortexRuntime` orchestrates chat, memory, and retrieval |
| Testability | Mock any adapter; core logic stays pure |

The framework is designed for teams who need to ship fast in development and retain architectural optionality in production.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Application                         │
│         (API route, worker, CLI, SaaS backend, agent)           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      KortexRuntime (@kortex/core)                 │
│   chat() · stream() · remember() · searchMemory() ·           │
│   retrieveContext() · ingest() · runTool() · runAgent()         │
│   createKortexFromEnv() (@kortex/config)                        │
└───────┬─────────────────┬─────────────────┬─────────────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────────┐
│  AIProvider   │ │MemoryProvider │ │  VectorProvider   │
│  (LLM adapter)│ │ (persistence) │ │ (similarity search)│
└───────┬───────┘ └───────┬───────┘ └─────────┬─────────┘
        │                 │                   │
        ▼                 ▼                   ▼
   @kortex/openai    @kortex/postgres     @kortex/pgvector
   @kortex/anthropic @kortex/redis        @kortex/qdrant
   @kortex/gemini    …                    …
   @kortex/ollama   (all swappable via interfaces)
```

**Core principle:** `@kortex/core` defines interfaces and orchestration only. It does not import OpenAI, Anthropic, PostgreSQL, Redis, Qdrant, or MCP SDKs at compile time. Adapters live in separate packages and are wired via `createKortexFromEnv()` or manual injection.

---

## Bring Your Own LLM

Kortex never hardcodes a model vendor. Set `AI_PROVIDER` to the backend you already run:

| Provider | `AI_PROVIDER` | Credentials / endpoint |
|----------|---------------|------------------------|
| OpenAI | `openai` | `OPENAI_API_KEY` |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` |
| Google Gemini | `gemini` | `GEMINI_API_KEY` |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` |
| Ollama | `ollama` | `OLLAMA_BASE_URL` |
| LM Studio | `lmstudio` | `LMSTUDIO_BASE_URL` |
| OpenClaw | `openclaw` | `OPENCLAW_BASE_URL`, optional `OPENCLAW_TOKEN` |
| Hermes | `hermes` | `HERMES_BASE_URL`, optional `HERMES_TOKEN` |

```env
AI_PROVIDER=anthropic          # or any provider above
AI_MODEL=claude-3-5-sonnet-latest
ANTHROPIC_API_KEY=...
```

Hosted API providers use vendor keys. Self-hosted HTTP providers use a configurable `baseUrl` (and optional token) — point them at wherever your model server runs.

**Two integration modes:**

1. **Environment bootstrap** — `createKortexFromEnv()` from `@kortex/config` dynamically loads the adapter matching `AI_PROVIDER`.
2. **Explicit injection** — construct any adapter and pass it to `new KortexRuntime({ provider })`.

Your application code talks to `KortexRuntime`, not to vendor SDKs.

---

## Bring Your Own Database

Memory and vector search are optional plugins, not framework requirements.

| Capability | Configuration | Adapter | When required |
|------------|---------------|---------|---------------|
| Chat only | `AI_PROVIDER` + provider credentials | Any `AIProvider` | Always |
| Conversation history | `MEMORY_PROVIDER=postgres\|redis` | `@kortex/postgres`, `@kortex/redis` | When `useMemory: true` |
| RAG / retrieval | `VECTOR_PROVIDER=pgvector\|qdrant` | `@kortex/pgvector`, `@kortex/qdrant` | When `useRag: true` |

```env
MEMORY_PROVIDER=postgres
VECTOR_PROVIDER=pgvector
DATABASE_URL=postgresql://user:pass@your-db-host:5432/kortex

# or Redis memory + Qdrant vectors
MEMORY_PROVIDER=redis
REDIS_URL=redis://your-redis-host:6379
VECTOR_PROVIDER=qdrant
QDRANT_URL=https://your-qdrant-cluster
QDRANT_API_KEY=...
```

Kortex does not provision databases, host models, or manage API keys. You connect infrastructure you already operate — managed cloud, private VPC, or self-hosted.

---

## Installation

**Requirements:** Node.js 20+, pnpm 9+

```bash
git clone https://github.com/kortex-ai/kortex.git
cd kortex
pnpm install
cp .env.example .env
pnpm build
pnpm test
```

Install only the packages you need in your app:

```bash
pnpm add @kortex/core @kortex/config @kortex/anthropic @kortex/postgres @kortex/pgvector
```

### Monorepo scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm test` | Run test suites |
| `pnpm docker:up` | Start optional reference infrastructure (Docker) |
| `pnpm demo` | Run the reference chatbot app |
| `pnpm docs` | Run the documentation site |
| `pnpm dev` | Start dev watchers |
| `pnpm db:migrate` | Apply PostgreSQL migrations (Drizzle) |
| `pnpm db:schema` | Bootstrap schema via raw SQL |
| `pnpm db:studio` | Open Drizzle Studio |

---

## Environment Setup

Copy the example file and configure for your stack:

```bash
cp .env.example .env
```

```env
# AI — pick one provider
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini

# Provider credentials (set only what your AI_PROVIDER needs)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
OLLAMA_BASE_URL=
LMSTUDIO_BASE_URL=
OPENCLAW_BASE_URL=
HERMES_BASE_URL=

# Memory & vectors (optional)
MEMORY_PROVIDER=none
VECTOR_PROVIDER=none
DATABASE_URL=
REDIS_URL=
QDRANT_URL=
QDRANT_API_KEY=

# Embeddings: openai | local | provider
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small

MCP_ENABLED=false
KORTEX_DEBUG=false
```

`@kortex/config` validates the selected provider at startup. Database URLs are only required when you enable the corresponding memory or vector provider.

---

## Reference Chatbot App

The sample application in `apps/chatbot-demo` shows how to embed Kortex in a Next.js API route. It is a reference implementation — the framework packages are the product.

```bash
pnpm --filter @kortex/chatbot-demo dev
```

The demo includes:

- Streaming responses via `POST /api/chat`
- `createKortexFromEnv()` server bootstrap
- Provider selector (switch `AI_PROVIDER` per request)
- Provider settings panel, RAG upload, retrieved context display
- Optional memory and RAG toggles
- `userId` and `sessionId` for scoped conversation state
- Tool execution via `/tool <name> {}`

Deploy it like any Next.js app, or copy the API route pattern into your own backend.

---

## Optional Reference Infrastructure

The repo includes `docker-compose.yml` for **local development and testing** of Postgres+pgvector, Redis, and Qdrant. You do not need Docker to use Kortex — point `DATABASE_URL`, `REDIS_URL`, and `QDRANT_URL` at your existing services instead.

```bash
docker compose up -d
cp .env.example .env
# Set DATABASE_URL, REDIS_URL, QDRANT_URL to your service endpoints
pnpm db:schema
```

| Service | Default port | Purpose |
|---------|--------------|---------|
| PostgreSQL + pgvector | 5432 | Memory + vectors |
| Redis | 6379 | Redis memory |
| Qdrant | 6333 | Vector search |

---

## PostgreSQL + pgvector

Kortex stores conversation history, long-term memories, document chunks, and vector embeddings in PostgreSQL with the [pgvector](https://github.com/pgvector/pgvector) extension.

### Configure

```env
DATABASE_URL=postgresql://user:password@your-host:5432/kortex
MEMORY_PROVIDER=postgres
VECTOR_PROVIDER=pgvector
```

### Apply schema

```bash
pnpm db:migrate    # tracked migrations (recommended)
# or
pnpm db:schema     # idempotent SQL bootstrap (uses DATABASE_URL)
```

### Schema overview

| Table | Purpose |
|-------|---------|
| `users` | Application users (`external_id` for client-side IDs) |
| `sessions` | Conversation sessions |
| `messages` | Chat history |
| `memories` | Long-term memory entries |
| `documents` | RAG source documents |
| `document_chunks` | Chunked text for ingestion |
| `embeddings` | `vector(1536)` with HNSW cosine index |
| `tool_runs` | Tool execution audit log |
| `agent_runs` | Agent execution audit log |

Full migration docs: [packages/db/README.md](./packages/db/README.md)

---

## Example Code

### Bootstrap from environment

Works with any configured `AI_PROVIDER`:

```typescript
import { createKortexFromEnv } from '@kortex/config';

const kortex = await createKortexFromEnv();

const response = await kortex.chat({
  userId: 'user_123',
  sessionId: 'session_456',
  message: 'What did we discuss last time?',
  useMemory: true,
  useRag: true,
});

console.log(response.content);
```

### Streaming

```typescript
for await (const chunk of kortex.stream({
  userId: 'user_123',
  sessionId: 'session_456',
  message: 'Explain retrieval-augmented generation.',
})) {
  process.stdout.write(chunk.content);
}
```

### Manual dependency injection

Swap any provider without changing runtime code:

```typescript
import { KortexRuntime } from '@kortex/core';
import { AnthropicProvider } from '@kortex/anthropic';
import { PostgresMemoryProvider } from '@kortex/postgres';
import { QdrantVectorProvider } from '@kortex/qdrant';

const kortex = new KortexRuntime({
  provider: new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-3-5-sonnet-latest',
  }),
  memory: new PostgresMemoryProvider({ databaseUrl: process.env.DATABASE_URL! }),
  vector: new QdrantVectorProvider({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY,
  }),
});

await kortex.remember({
  userId: 'user_123',
  content: 'Prefers concise technical answers.',
});

const memories = await kortex.searchMemory({
  userId: 'user_123',
  query: 'preferences',
});

const context = await kortex.retrieveContext({
  query: 'deployment checklist',
  userId: 'user_123',
});
```

Other provider combinations:

```typescript
import { OllamaProvider } from '@kortex/ollama';
import { RedisMemoryProvider } from '@kortex/redis';
import { PgVectorProvider } from '@kortex/pgvector';

new KortexRuntime({
  provider: new OllamaProvider({ baseUrl: process.env.OLLAMA_BASE_URL, model: 'llama3.2' }),
  memory: new RedisMemoryProvider({ url: process.env.REDIS_URL! }),
  vector: new PgVectorProvider({ databaseUrl: process.env.DATABASE_URL! }),
});
```

---

## Package Ecosystem

| Package | Description |
|---------|-------------|
| [`@kortex/core`](./packages/core) | `KortexRuntime`, interfaces |
| [`@kortex/config`](./packages/config) | `createKortexFromEnv()`, env validation |
| [`@kortex/errors`](./packages/errors) | `KortexError`, `ConfigError` |
| [`@kortex/logger`](./packages/logger) | Structured JSON logging |
| [`@kortex/openai`](./packages/providers/openai) | OpenAI adapter |
| [`@kortex/anthropic`](./packages/providers/anthropic) | Anthropic adapter |
| [`@kortex/gemini`](./packages/providers/gemini) | Gemini adapter |
| [`@kortex/openrouter`](./packages/providers/openrouter) | OpenRouter adapter |
| [`@kortex/ollama`](./packages/providers/ollama) | Ollama adapter |
| [`@kortex/lmstudio`](./packages/providers/lmstudio) | LM Studio adapter |
| [`@kortex/openclaw`](./packages/providers/openclaw) | OpenClaw HTTP adapter |
| [`@kortex/hermes`](./packages/providers/hermes) | Hermes HTTP adapter |
| [`@kortex/postgres`](./packages/memory/postgres) | PostgreSQL memory |
| [`@kortex/redis`](./packages/memory/redis) | Redis memory |
| [`@kortex/pgvector`](./packages/vector/pgvector) | pgvector store |
| [`@kortex/qdrant`](./packages/vector/qdrant) | Qdrant store |
| [`@kortex/rag`](./packages/rag) | RAG pipeline + document loaders |
| [`@kortex/mcp`](./packages/mcp) | MCP tool client |
| [`@kortex/agents`](./packages/agents) | Agent orchestration |
| [`@kortex/tools`](./packages/tools) | Builtin tool provider |
| [`@kortex/db`](./packages/db) | Schema, migrations, Drizzle ORM |

## Examples

| Example | Description |
|---------|-------------|
| [`examples/basic-chat`](./examples/basic-chat) | Minimal chat (any provider via `.env`) |
| [`examples/memory-chat`](./examples/memory-chat) | Session memory |
| [`examples/rag-chat`](./examples/rag-chat) | RAG ingestion + chat |
| [`examples/mcp-agent`](./examples/mcp-agent) | MCP tools |
| [`examples/local-llm`](./examples/local-llm) | Ollama / self-hosted LLM |
| [`examples/openclaw-chat`](./examples/openclaw-chat) | OpenClaw |
| [`examples/hermes-chat`](./examples/hermes-chat) | Hermes |

Packages publish under the `@kortex` npm scope. The monorepo uses **pnpm workspaces** and **Turborepo**.

---

## Provider Matrix

| Provider | Package | Auth | Notes |
|----------|---------|------|-------|
| OpenAI | `@kortex/openai` | API key | Chat + embeddings |
| Anthropic | `@kortex/anthropic` | API key | Messages API |
| Gemini | `@kortex/gemini` | API key | Google Generative Language API |
| OpenRouter | `@kortex/openrouter` | API key | Multi-model gateway |
| Ollama | `@kortex/ollama` | Optional | Self-hosted HTTP endpoint |
| LM Studio | `@kortex/lmstudio` | Optional | Self-hosted OpenAI-compatible server |
| OpenClaw | `@kortex/openclaw` | Optional token | Configurable HTTP adapter |
| Hermes | `@kortex/hermes` | Optional token | Configurable HTTP adapter |

---

## Roadmap

- [ ] npm publish for `@kortex/*` packages
- [x] Multi-LLM providers (OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio, OpenClaw, Hermes)
- [x] Redis memory and Qdrant vector backends
- [x] RAG ingestion pipeline (`@kortex/rag`)
- [x] MCP tool integration (`@kortex/mcp`)
- [x] Multi-agent orchestration (`@kortex/agents`)
- [ ] OpenTelemetry observability
- [x] Documentation site (`pnpm docs`)
- [ ] `create-kortex-app` CLI scaffolding

---

## Contributing

We welcome contributions that align with Kortex architecture principles:

1. **Core stays vendor-neutral** — no provider SDKs in `@kortex/core`
2. **Interfaces first** — implement adapters, don't leak implementation into the runtime
3. **Dependency injection** — every external system is swappable
4. **Tests** — unit tests for core; integration examples for adapters

```bash
git clone https://github.com/kortex-ai/kortex.git
cd kortex
pnpm install
cp .env.example .env
pnpm build
pnpm test
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on adding providers, running tests, and opening pull requests.

---

## License

[MIT](./LICENSE)
