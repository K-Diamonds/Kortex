import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const root = resolve(import.meta.dirname, '..');

/** MVP build order (steps 1–20) mapped to package paths */
const MVP_PACKAGES: Array<{ step: number; name: string; path: string; exportFile?: string }> = [
  { step: 1, name: 'Core interfaces', path: 'packages/core' },
  { step: 2, name: 'AIRuntime', path: 'packages/core' },
  { step: 3, name: 'OpenAI provider', path: 'packages/providers/openai' },
  { step: 4, name: 'Config loader', path: 'packages/config' },
  { step: 5, name: 'chat()', path: 'packages/core' },
  { step: 6, name: 'stream()', path: 'packages/core' },
  { step: 7, name: 'Postgres memory', path: 'packages/memory/postgres' },
  { step: 8, name: 'pgvector search', path: 'packages/vector/pgvector' },
  { step: 9, name: 'Chatbot demo', path: 'apps/chatbot-demo', exportFile: 'src/app/api/chat/route.ts' },
  { step: 10, name: 'README', path: '.', exportFile: 'README.md' },
  { step: 11, name: 'Tests', path: 'packages/core/src', exportFile: 'runtime.test.ts' },
  { step: 12, name: 'Anthropic provider', path: 'packages/providers/anthropic' },
  { step: 13, name: 'Gemini provider', path: 'packages/providers/gemini' },
  { step: 14, name: 'OpenRouter provider', path: 'packages/providers/openrouter' },
  { step: 15, name: 'Ollama provider', path: 'packages/providers/ollama' },
  { step: 16, name: 'OpenClaw provider', path: 'packages/providers/openclaw' },
  { step: 17, name: 'Hermes provider', path: 'packages/providers/hermes' },
  { step: 18, name: 'RAG package', path: 'packages/rag' },
  { step: 19, name: 'MCP package', path: 'packages/mcp' },
  { step: 20, name: 'Agents package', path: 'packages/agents' },
];

describe('MVP build order — package structure', () => {
  it.each(MVP_PACKAGES)('step $step: $name exists at $path', ({ path, exportFile }) => {
    const base = resolve(root, path);
    expect(existsSync(base)).toBe(true);

    if (exportFile) {
      expect(existsSync(resolve(base, exportFile))).toBe(true);
    } else if (path.startsWith('packages/')) {
      expect(existsSync(resolve(base, 'package.json'))).toBe(true);
      expect(existsSync(resolve(base, 'dist/index.js'))).toBe(true);
    }
  });

  it('database schema SQL is present (step 8)', () => {
    expect(existsSync(resolve(root, 'packages/db/sql/001_initial_schema.sql'))).toBe(true);
  });

  it('bootstrap re-exports createKortexFromEnv (deprecated)', () => {
    expect(existsSync(resolve(root, 'packages/bootstrap/dist/index.js'))).toBe(true);
  });
});
