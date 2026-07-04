# Kortex MVP Build Order

The recommended sequence for building and shipping Kortex. Each step depends on the ones above it. Steps **1–13** are complete in this repository; **step 14** is intentionally deferred.

## Build sequence

| # | Step | Location | Status |
|---|------|----------|--------|
| 1 | Monorepo setup | `pnpm-workspace.yaml`, `turbo.json`, `package.json` | ✅ Done |
| 2 | Core interfaces | `packages/core/src/types.ts` — `AIProvider`, `MemoryProvider`, `VectorProvider` | ✅ Done |
| 3 | Runtime dependency injection | `packages/core/src/runtime.ts` — `new KortexRuntime({ provider, memory, vector })` | ✅ Done |
| 4 | Config loader | `packages/config` — `loadConfig()`, `validateConfig()` | ✅ Done |
| 5 | Logger | `packages/logger` — structured JSON logging | ✅ Done |
| 6 | OpenAI provider | `packages/providers/openai` — `OpenAIProvider` | ✅ Done |
| 7 | Postgres memory | `packages/memory/postgres` — `PostgresMemoryProvider` | ✅ Done |
| 8 | Pgvector provider | `packages/vector/pgvector` — `PgVectorProvider` | ✅ Done |
| 9 | `createKortexFromEnv()` | `packages/config/src/factory.ts` — dynamic adapter loading | ✅ Done |
| 10 | Docs site API | `apps/docs-site/src/app/api/kortex/chat/route.ts` | ✅ Done |
| 11 | Docs site UI | `apps/docs-site` + `@kortex/ui` `<Kortex />` | ✅ Done |
| 12 | Tests | `packages/*/src/*.test.ts` | ✅ Done |
| 13 | README | `README.md` | ✅ Done |
| 14 | Add more providers later | `packages/providers/*` placeholders | 🔜 Post-MVP |

## Dependency graph

```
 1  Monorepo (pnpm + turbo)
      ↓
 2  Core interfaces
      ↓
 3  KortexRuntime (DI)  ←──  4 Config  +  5 Logger
      ↓
 6  OpenAI provider
      ↓
 7  Postgres memory  +  8 Pgvector provider  +  @kortex/db migrations
      ↓
 9  createKortexFromEnv() (@kortex/config)
      ↓
10  Chatbot API  +  11 Chatbot UI
      ↓
12  Tests  +  13 README
      ↓
14  Additional providers (anthropic, gemini, ollama, …)
```

## Verify each step

```bash
# 1 — install & build
pnpm install && pnpm build

# 4–6, 9, 12 — unit tests
pnpm --filter @kortex/config test
pnpm --filter @kortex/core test
pnpm --filter @kortex/openai test

# 7–8 — database (optional)
docker run -d --name kortex-postgres \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kortex \
  -p 5432:5432 pgvector/pgvector:pg16

export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kortex
pnpm db:migrate

# 10–11 — demo
pnpm --filter @kortex/docs-site dev
# → http://localhost:3001
```

## Step 14 — Adding providers later

Placeholder packages are reserved under `packages/providers/`:

| Package | Provider |
|---------|----------|
| `@kortex/anthropic` | Anthropic |
| `@kortex/gemini` | Google Gemini |
| `@kortex/openrouter` | OpenRouter |
| `@kortex/ollama` | Ollama (local) |
| `@kortex/lmstudio` | LM Studio |
| `@kortex/openclaw` | OpenClaw |
| `@kortex/hermes` | Hermes |

To add a provider:

1. Implement `AIProvider` from `@kortex/core` in `packages/providers/<name>/`
2. Add env fields to `@kortex/config`
3. Register a dynamic loader in `packages/config/src/factory.ts`
4. Add tests and document in `README.md`

**Rule:** `@kortex/core` must never statically import provider packages — use dependency injection or dynamic `import()`.

## MVP package map

| Step | Package |
|------|---------|
| 2–3 | `@kortex/core` |
| 4, 9 | `@kortex/config` |
| 5 | `@kortex/logger` |
| 6 | `@kortex/openai` |
| 7 | `@kortex/postgres` |
| 8 | `@kortex/pgvector` |
| 7–8 schema | `@kortex/db` |
| 10–11 | `@kortex/docs-site` |
