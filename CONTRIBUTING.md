# Contributing to Kortex

Thank you for your interest in contributing to Kortex! This document outlines how to get started.

## Development Setup

```bash
git clone https://github.com/kortex-ai/kortex.git
cd kortex
pnpm install
cp .env.example .env
pnpm build
```

## Project Structure

- `packages/core` — AI Runtime, interfaces, and `fromEnv()` factory
- `packages/providers/*` — LLM provider adapters (OpenAI, Anthropic, etc.)
- `packages/memory/*` — Conversation and user memory backends
- `packages/vector/*` — Vector storage and similarity search
- `packages/rag` — Document ingestion and retrieval pipeline
- `packages/mcp` — Model Context Protocol client utilities
- `packages/agents` — Reusable agent abstractions
- `packages/tools` — Built-in tool providers
- `apps/chatbot-demo` — Next.js demo application

## Architecture Principles

1. **Clean architecture** — Domain logic in `core`, adapters in provider packages
2. **Dependency inversion** — Core defines interfaces; providers implement them
3. **Adapter pattern** — Swap providers via configuration, not code changes
4. **Provider-agnostic** — Application code never imports provider SDKs directly

## Adding a New Provider

1. Create `packages/providers/<name>/`
2. Implement the `AIProvider` interface from `@kortex/core`
3. Export a `create<Name>Provider()` factory
4. Register in `packages/core/src/index.ts` provider loaders
5. Add config fields to `@kortex/config`
6. Update `.env.example` and README

## Running Tests

```bash
pnpm test
pnpm typecheck
pnpm lint
```

## Pull Request Guidelines

- Keep PRs focused on a single concern
- Add tests for new behavior
- Update documentation when changing public APIs
- Follow existing TypeScript and naming conventions
- Ensure `pnpm build` passes

## Code Style

- TypeScript strict mode
- Prettier for formatting (`pnpm format`)
- ESLint for linting (`pnpm lint`)

## Questions?

Open a GitHub issue or discussion. We're happy to help!
