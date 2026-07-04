# @kortex/lmstudio

**Status: Beta** — LM Studio self-hosted OpenAI-compatible server adapter for Kortex.

| Capability | Supported                                               |
| ---------- | ------------------------------------------------------- |
| Chat       | Yes                                                     |
| Streaming  | Yes                                                     |
| Embeddings | Yes (if your LM Studio server exposes `/v1/embeddings`) |

## Environment

```env
AI_PROVIDER=lmstudio
LMSTUDIO_BASE_URL=http://localhost:1234
AI_MODEL=local-model
```

Kortex is currently in alpha / developer preview.
