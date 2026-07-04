# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0-alpha] - 2026-07-03

### Kortex 0.1.0-alpha — developer preview

**Kortex is currently in alpha / developer preview.** It is not production-ready yet. APIs, adapters, and configuration may change before `1.0.0`.

### Production readiness (alpha)

| Area                  | Status            |
| --------------------- | ----------------- |
| Core interfaces       | Stable foundation |
| OpenAI provider       | Working           |
| Postgres memory       | Working           |
| pgvector vector store | Working           |
| Other LLM providers   | Experimental      |
| Redis / Qdrant        | Experimental      |
| RAG                   | Experimental      |
| Agents                | Experimental      |
| MCP                   | Experimental      |

### Known limitations

- No npm publish or long-term support guarantees during alpha
- Reference path: OpenAI + Postgres + pgvector; other adapters less tested
- OpenTelemetry not included
- MCP and agents are early implementations

### What's included

**Multi-LLM:** OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio, OpenClaw, Hermes

**Memory:** PostgreSQL and Redis providers with session history and long-term memory

**Vector search:** pgvector and Qdrant with cosine similarity retrieval

**RAG:** Document ingestion, chunking, embedding, vector storage, context retrieval, prompt injection

**MCP tools:** Server registration, tool listing, execution, runtime `runTool()` abstraction

**Agents:** Agent definitions, system instructions, memory-enabled and tool-enabled execution

**Chatbot demo:** Next.js reference app with streaming, provider selector, memory/RAG toggles

**Docker:** Optional `docker compose` for Postgres+pgvector, Redis, Qdrant

**Docs:** Documentation site (`pnpm docs`)

### API

```typescript
import { createKortexFromEnv } from '@kortex/config';
const kortex = await createKortexFromEnv();
await kortex.chat({ userId, sessionId, message: 'Hello' });
```

## [0.1.0] - 2026-07-02

Initial monorepo scaffold.
