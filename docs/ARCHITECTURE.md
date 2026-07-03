# Architecture

Kortex follows **clean architecture** with clear boundaries between domain logic and infrastructure.

## Layers

```
┌─────────────────────────────────────────────────┐
│  Applications (chatbot-demo, your app)          │
├─────────────────────────────────────────────────┤
│  Use Cases (agents, rag, mcp, tools)            │
├─────────────────────────────────────────────────┤
│  Domain (core — AIRuntime, interfaces)          │
├─────────────────────────────────────────────────┤
│  Adapters (providers, memory, vector)           │
└─────────────────────────────────────────────────┘
```

## Core Interfaces

| Interface | Responsibility |
|-----------|----------------|
| `AIProvider` | LLM chat, stream, embed |
| `MemoryProvider` | Conversations, user memory, sessions |
| `VectorProvider` | Embeddings storage, similarity search |
| `ToolProvider` | Tool listing and execution |
| `Agent` | Instruction-driven autonomous execution |

## AIRuntime

The `AIRuntime` class orchestrates all providers:

- `chat()` / `stream()` — LLM inference with optional memory persistence
- `embed()` — Generate embeddings via the active provider
- `remember()` / `searchMemory()` — User memory operations
- `retrieveContext()` — RAG context retrieval via vector search
- `runTool()` — Execute tools from registered providers

## Provider Switching

Set `AI_PROVIDER` in `.env`. The `fromEnv()` factory in `@kortex/bootstrap` dynamically loads the correct adapter — no code changes required.

## Data Flow (RAG)

1. **Ingest** — Documents chunked via `@kortex/rag`
2. **Embed** — Chunks embedded via active `AIProvider`
3. **Store** — Vectors stored in `VectorProvider` (pgvector)
4. **Retrieve** — Query embedded, similar chunks returned
5. **Generate** — Context injected into chat messages
