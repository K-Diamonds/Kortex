# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-07-03

### Kortex v1.0 — production-ready open-source AI Runtime Framework

**Multi-LLM:** OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio, OpenClaw, Hermes

**Memory:** PostgreSQL and Redis providers with session history and long-term memory

**Vector search:** pgvector and Qdrant with cosine similarity retrieval

**RAG:** Document ingestion, chunking, embedding, vector storage, context retrieval, prompt injection

**MCP tools:** Server registration, tool listing, execution, runtime `runTool()` abstraction

**Agents:** Agent definitions, system instructions, memory-enabled and tool-enabled execution

**Chatbot demo:** Next.js app with streaming, provider selector, memory/RAG toggles, file upload, tools panel

**Docker:** `docker compose up -d` for Postgres+pgvector, Redis, Qdrant

**Docs:** Full documentation site at `apps/docs-site` (`pnpm docs`)

**DevOps:** GitHub Actions CI, `.env.example`, CONTRIBUTING, SECURITY, LICENSE

### API

```typescript
import { createKortexFromEnv } from "@kortex/config";
const kortex = await createKortexFromEnv();
await kortex.chat({ userId, sessionId, message: "Hello" });
```

## [0.1.0] - 2026-07-02

Initial MVP scaffold.
