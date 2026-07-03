# @kortex/openclaw

**Status: Experimental** — generic HTTP-compatible adapter for Kortex.

OpenClaw is an **experimental HTTP-compatible adapter** built on `@kortex/provider-shared`. It targets servers that expose OpenAI-style REST endpoints. It is not tied to a specific vendor SDK — validate your deployment before use.

| Capability | Supported |
|------------|-----------|
| Chat | Yes† |
| Streaming | Yes† |
| Embeddings | Yes† |

† Assumes `/v1/chat/completions`, `/v1/embeddings`, and `/v1/models` on your server.

## Environment

```env
AI_PROVIDER=openclaw
OPENCLAW_BASE_URL=http://localhost:18789
OPENCLAW_TOKEN=          # optional
AI_MODEL=default
```

Kortex is currently in alpha / developer preview.
