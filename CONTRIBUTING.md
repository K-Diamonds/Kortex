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

**Public product surface**

- `apps/docs-site` — public documentation website (deploy separately to Vercel/Netlify)
- `packages/core` — `KortexRuntime`, interfaces, and types (no env wiring)
- `packages/config` — `createKortex()`, `createKortexFromEnv()`, env validation
- `packages/ui` — web UI (`<Kortex />` for React/Next.js, `<kortex-ui>` Web Component)
- `packages/react-native` — native UI (`<Kortex />`)

**Adapters and tooling**

- `packages/providers/*` — LLM provider adapters (OpenAI, Anthropic, etc.)
- `packages/memory/*` — Conversation and user memory backends
- `packages/vector/*` — Vector storage and similarity search
- `packages/rag` — Document ingestion and retrieval pipeline
- `packages/mcp` — Model Context Protocol client utilities
- `packages/agents` — Reusable agent abstractions
- `packages/tools` — Built-in tool providers
- `apps/docs-site` — Documentation site with embedded `@kortex/ui` chat widget

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

## GitHub CI/CD

CI mirrors the [CreatorOS](https://github.com/KOfferman/CreatorOS) pattern: workflow env from repository secrets/variables, `CI_LITE` for PR checks without private keys, and optional Vercel deploy on `main`.

### PR / push checks (no secrets required)

```bash
pnpm install --frozen-lockfile
pnpm format:check && pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

### Sync secrets to GitHub

1. Copy `.env.example` to `.env.local` and fill in values
2. Optional: copy `.github/env.production.example` → `.github/env.production.local`
3. Copy `apps/docs-site/.env.vercel.example` → `apps/docs-site/.env.vercel` and set Vercel project IDs
4. In Vercel dashboard, set **Root Directory** to `apps/docs-site`
5. Run:

```bash
./scripts/sync-github-env.sh --repo YOUR_ORG/kortex
```

### Validate env locally

```bash
CI_LITE=true ./scripts/check-github-env.sh   # skips secret checks
./scripts/check-github-env.sh                # full validation (set env vars first)
```

### Workflow jobs

| Job             | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| `monorepo`      | lint, typecheck, build, test                          |
| `docs-site`     | Next.js docs site build                               |
| `docker-build`  | Verify `apps/docs-site/Dockerfile`                    |
| `deploy-vercel` | Production deploy on `main` (requires Vercel secrets) |

## Questions?

Open a GitHub issue or discussion. We're happy to help!
