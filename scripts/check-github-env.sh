#!/usr/bin/env bash
# Validate required GitHub secrets/variables are present in the job environment.
# Usage: ./scripts/check-github-env.sh
set -euo pipefail

# PR/portfolio CI uses mocked providers — no private secrets required.
if [ "${CI_LITE:-}" = "true" ]; then
  echo "CI lite mode — skipping private secret validation"
  exit 0
fi

missing=0

check_secret() {
  if [ -z "${!1:-}" ]; then
    echo "Missing GitHub secret: $2" >&2
    missing=1
  fi
}

check_var() {
  if [ -z "${!1:-}" ]; then
    echo "Missing GitHub variable: $2" >&2
    missing=1
  fi
}

# Core runtime config (sync from .env via scripts/sync-github-env.sh)
check_var AI_PROVIDER AI_PROVIDER
check_var MEMORY_PROVIDER MEMORY_PROVIDER
check_var VECTOR_PROVIDER VECTOR_PROVIDER
check_var EMBEDDING_PROVIDER EMBEDDING_PROVIDER

provider="${AI_PROVIDER:-openai}"
case "$provider" in
  openai) check_secret OPENAI_API_KEY OPENAI_API_KEY ;;
  anthropic) check_secret ANTHROPIC_API_KEY ANTHROPIC_API_KEY ;;
  gemini) check_secret GEMINI_API_KEY GEMINI_API_KEY ;;
  openrouter) check_secret OPENROUTER_API_KEY OPENROUTER_API_KEY ;;
  ollama) check_var OLLAMA_BASE_URL OLLAMA_BASE_URL ;;
  lmstudio) check_var LMSTUDIO_BASE_URL LMSTUDIO_BASE_URL ;;
  openclaw) check_var OPENCLAW_BASE_URL OPENCLAW_BASE_URL ;;
  hermes) check_var HERMES_BASE_URL HERMES_BASE_URL ;;
  *)
    echo "Unknown AI_PROVIDER: $provider" >&2
    missing=1
    ;;
esac

memory="${MEMORY_PROVIDER:-none}"
if [ "$memory" = "postgres" ]; then
  check_secret DATABASE_URL DATABASE_URL
elif [ "$memory" = "redis" ]; then
  check_secret REDIS_URL REDIS_URL
fi

vector="${VECTOR_PROVIDER:-none}"
if [ "$vector" = "pgvector" ]; then
  check_secret DATABASE_URL DATABASE_URL
elif [ "$vector" = "qdrant" ]; then
  check_var QDRANT_URL QDRANT_URL
fi

# Optional — warn only
for optional in REDIS_URL QDRANT_API_KEY OPENCLAW_TOKEN HERMES_TOKEN; do
  if [ -z "${!optional:-}" ]; then
    echo "Optional not set: $optional" >&2
  fi
done

if [ "$missing" -ne 0 ]; then
  echo "Run: ./scripts/sync-github-env.sh --repo YOUR_ORG/kortex" >&2
  exit 1
fi

echo "GitHub env OK"
