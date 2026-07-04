# Kortex

**An open-source AI Runtime Framework for building chatbots, agents, RAG pipelines, and memory-backed applications — with swappable LLM providers and zero vendor lock-in.**

Kortex is currently in alpha / developer preview. APIs, adapters, and defaults may change before `1.0.0`. It is not production-ready yet — see [Production Readiness](#production-readiness) below.

Kortex is not a chatbot. It is the runtime layer underneath one: a TypeScript framework that unifies chat, streaming, embeddings, conversation memory, vector retrieval, tools, and agents behind a single, testable API.

You bring your own models, databases, and infrastructure. Kortex wires them together — in the cloud, on-prem, at the edge, or in your own product.

> **Kortex 0.1.0-alpha** — Multi-LLM · Memory · Vector · RAG · MCP · Agents · Docker · Docs (`pnpm docs`)

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

The framework is designed for teams who want a clear integration layer in development and the option to harden specific adapters as they mature toward production use.

---

## Production Readiness

Kortex is currently in alpha / developer preview. Use it to evaluate architecture and build prototypes — not as a drop-in replacement for a battle-tested production stack without your own validation.

| Area | Status |
|------|--------|
| **Core interfaces** (`@kortex/core`) | Stable — `AIProvider`, `MemoryProvider`, `VectorProvider`, and `KortexRuntime` APIs are the foundation we intend to keep compatible |
| **OpenAI provider** (`@kortex/openai`) | **Stable** — chat, streaming, and embeddings; reference adapter |
| **Beta LLM providers** (Anthropic, Gemini, OpenRouter, Ollama, LM Studio) | Implemented with less coverage than OpenAI; APIs may change |
| **Experimental HTTP adapters** (OpenClaw, Hermes) | Generic OpenAI-compatible HTTP adapters — validate your endpoint before use |
| **Postgres memory** (`@kortex/postgres`) | Working — session history and long-term memory with schema migrations |
| **pgvector store** (`@kortex/pgvector`) | Working — cosine similarity retrieval with the bundled PostgreSQL schema |
| **Redis memory** (`@kortex/redis`) | Experimental |
| **Qdrant vectors** (`@kortex/qdrant`) | Experimental |
| **RAG pipeline** (`@kortex/rag`) | Experimental — ingestion and retrieval work but APIs may evolve |
| **Agents** (`@kortex/agents`) | Experimental — basic orchestration only |
| **MCP** (`@kortex/mcp`) | Experimental — tool registration and execution are early |

### Known limitations

- **Not production-ready** — no stability guarantees, semver discipline, or long-term support until `1.0.0`.
- **npm publish pending** — install from the monorepo or link workspace packages today.
- **Provider parity** — only the OpenAI + Postgres + pgvector path is the reference “happy path”; other adapters may have gaps.
- **Observability** — OpenTelemetry and production-grade tracing are not shipped yet.
- **MCP & agents** — limited protocol coverage, no multi-agent coordination guarantees.
- **Breaking changes** — expect interface and config changes during alpha; pin commits or versions if you depend on Kortex early.

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

Kortex never hardcodes a model vendor. Set `AI_PROVIDER` to the backend you already run.

**Provider status**

| Tier | Providers |
|------|-----------|
| **Stable** | OpenAI — reference adapter with the most test coverage |
| **Beta** | Anthropic, Gemini, OpenRouter, Ollama, LM Studio — implemented and usable, less coverage than OpenAI |
| **Experimental** | OpenClaw, Hermes — generic HTTP-compatible adapters; validate your server's OpenAI-style endpoints |

See the full [Provider Matrix](#provider-matrix) for chat, streaming, embeddings, and required environment variables.

```env
AI_PROVIDER=anthropic          # stable: openai | beta: anthropic, gemini, openrouter, ollama, lmstudio | experimental: openclaw, hermes
AI_MODEL=claude-3-5-sonnet-latest
ANTHROPIC_API_KEY=...
```

Hosted API providers use vendor keys. Self-hosted providers use a configurable `baseUrl` (and optional token). **OpenClaw** and **Hermes** are experimental HTTP-compatible adapters — they assume OpenAI-style `/v1/chat/completions`, `/v1/embeddings`, and `/v1/models` routes on your server.

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
EMBEDDING_DIMENSIONS=1536

MCP_ENABLED=false
KORTEX_DEBUG=false
```

`@kortex/config` validates the selected provider at startup. Database URLs are only required when you enable the corresponding memory or vector provider.

---

## Reference Chatbot App

The sample application in `apps/chatbot-demo` shows how to embed the `<Kortex />` UI and wire it to a Next.js API route. It is a reference implementation — the framework packages are the product.

```bash
pnpm --filter @kortex/chatbot-demo dev
```

The demo includes:

- `<Kortex />` from `@kortex/ui` (widget mode, dark theme)
- `POST /api/kortex/chat` — backend route owned by your app
- `createKortexFromEnv()` server bootstrap (secrets from `.env` only)
- Memory, RAG, tools, and streaming toggles via UI props
- `userId` and `sessionId` for scoped conversation state

Deploy it like any Next.js app, or copy the API route pattern into your own backend.

---

## Frontend UI (`@kortex/ui`)

**React / Next.js** — import the React component:

```tsx
import { Kortex } from '@kortex/ui';

<Kortex
  apiEndpoint="/api/kortex/chat"
  title="Ask AI"
  subtitle="Powered by Kortex"
  theme="dark"
  variant="widget"
  position="bottom-right"
  memory
  rag
  tools
  stream
  markdown
/>
```

**Vue / Svelte / Angular / Astro / HTML** — no `@kortex/vue` wrapper packages. Use `registerKortexElement` from `@kortex/ui/element` and `<kortex-ui>` (not `<Kortex />`):

```html
<script type="module">
  import { registerKortexElement } from '@kortex/ui/element';
  registerKortexElement('kortex-ui');
</script>

<kortex-ui
  api-endpoint="/api/kortex/chat"
  title="Ask AI"
  theme="dark"
  memory
  rag
></kortex-ui>
```

**Security:** The UI only receives `apiEndpoint` and UI/runtime flags. Never pass API keys, database URLs, provider secrets, or model credentials to `<Kortex />` or `<kortex-ui>`.

### React Native (`@kortex/react-native`)

```tsx
import { Kortex } from '@kortex/react-native';

<Kortex
  apiEndpoint="https://mydomain.com/api/kortex/chat"
  title="Ask AI"
  theme="dark"
  memory
  rag
/>
```

---

## Backend route setup

Your API route owns provider, model, API keys, memory, vector store, RAG, MCP, tools, and agents. Use `.env` on the server (highly recommended but not required) or any secure configuration pattern — secrets must stay server-side. The frontend only calls `apiEndpoint`, which can be any route you control.

### Next.js example

```typescript
import { createKortex } from '@kortex/config';

const runtime = await createKortex({
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,

  memory: {
    provider: 'postgres',
    connectionString: process.env.DATABASE_URL,
  },

  vector: {
    provider: 'pgvector',
    connectionString: process.env.DATABASE_URL,
    dimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 1536),
  },
});

export async function POST(req: Request) {
  const body = await req.json();

  const response = await runtime.chat({
    userId: body.userId,
    sessionId: body.sessionId,
    message: body.message,
    useMemory: body.memory,
    useRag: body.rag,
  });

  return Response.json({ content: response.content, model: response.model });
}
```

For monorepo demos, `createKortexFromEnv()` reads `.env` and loads adapters dynamically. Run `pnpm docs` and open **Backend Route** for Web Component usage and a security checklist.

---

## Optional Reference Infrastructure

The repo includes `docker-compose.yml` for **local development and testing** of Postgres+pgvector, Redis, and Qdrant. You do not need Docker to use Kortex — point `DATABASE_URL`, `REDIS_URL`, and `QDRANT_URL` at your existing services instead.

```bash
docker compose up -d
cp .env.example .env
# Set DATABASE_URL, REDIS_URL, QDRANT_URL to your service endpoints
# Set EMBEDDING_DIMENSIONS before first schema apply (default 1536)
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
EMBEDDING_DIMENSIONS=1536
```

`EMBEDDING_DIMENSIONS` must match your embedding model output (default `1536` for `text-embedding-3-small`). **Set it before creating the `embeddings` table** — pgvector column dimensions cannot be migrated safely after vectors are stored.

### Apply schema

```bash
# Reads EMBEDDING_DIMENSIONS from .env (default 1536)
pnpm db:schema

# or tracked Drizzle migrations (initial migration uses vector(1536))
pnpm db:migrate
```

For non-default dimensions, use `pnpm db:schema` on a fresh database. If the `embeddings` table already exists with the wrong size, drop it and re-ingest vectors, or align `EMBEDDING_DIMENSIONS` with the existing `vector(N)` column.

### Schema overview

| Table | Purpose |
|-------|---------|
| `users` | Application users (`external_id` for client-side IDs) |
| `sessions` | Conversation sessions |
| `messages` | Chat history |
| `memories` | Long-term memory entries |
| `documents` | RAG source documents |
| `document_chunks` | Chunked text for ingestion |
| `embeddings` | `vector(EMBEDDING_DIMENSIONS)` — default `vector(1536)` with HNSW cosine index |
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
| [`@kortex/config`](./packages/config) | `createKortex()`, `createKortexFromEnv()`, env validation |
| [`@kortex/ui`](./packages/ui) | Web UI — `<Kortex />` (React/Next.js), `<kortex-ui>` (Web Component) |
| [`@kortex/react-native`](./packages/react-native) | React Native `<Kortex />` component |
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

| Provider | Package | Chat | Streaming | Embeddings | Status | Required env variables |
|----------|---------|------|-----------|------------|--------|------------------------|
| OpenAI | `@kortex/openai` | Yes | Yes | Yes | **Stable** | `AI_PROVIDER=openai`, `OPENAI_API_KEY`, `AI_MODEL` (optional) |
| Anthropic | `@kortex/anthropic` | Yes | Yes | No | **Beta** | `AI_PROVIDER=anthropic`, `ANTHROPIC_API_KEY`, `AI_MODEL` (optional) |
| Google Gemini | `@kortex/gemini` | Yes | Yes | Yes | **Beta** | `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, `AI_MODEL` (optional) |
| OpenRouter | `@kortex/openrouter` | Yes | Yes | Yes | **Beta** | `AI_PROVIDER=openrouter`, `OPENROUTER_API_KEY`, `AI_MODEL` (optional) |
| Ollama | `@kortex/ollama` | Yes | Yes | Yes | **Beta** | `AI_PROVIDER=ollama`, `OLLAMA_BASE_URL`, `AI_MODEL` (optional) |
| LM Studio | `@kortex/lmstudio` | Yes | Yes | Yes | **Beta** | `AI_PROVIDER=lmstudio`, `LMSTUDIO_BASE_URL`, `AI_MODEL` (optional) |
| OpenClaw | `@kortex/openclaw` | Yes | Yes | Yes† | **Experimental** | `AI_PROVIDER=openclaw`, `OPENCLAW_BASE_URL`, `OPENCLAW_TOKEN` (optional), `AI_MODEL` (optional) |
| Hermes | `@kortex/hermes` | Yes | Yes | Yes† | **Experimental** | `AI_PROVIDER=hermes`, `HERMES_BASE_URL`, `HERMES_TOKEN` (optional), `AI_MODEL` (optional) |

† **Experimental HTTP-compatible adapters** — OpenClaw and Hermes use `@kortex/provider-shared` to call OpenAI-style REST endpoints on your server. Embeddings only work if your endpoint exposes `/v1/embeddings`. Validate chat, streaming, and embeddings against your deployment before relying on them.

**Notes**

- Anthropic has no native embeddings API in Kortex — set `EMBEDDING_PROVIDER=openai` (or another backend) for RAG.
- Ollama and LM Studio are self-hosted; capabilities depend on the model server you run.
- Beta providers are implemented but receive less test coverage than OpenAI.

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
