import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { KortexRuntime } from '../packages/core/src/runtime.js';
import type {
  AIProvider,
  ChatResponse,
  MemoryEntry,
  MemoryProvider,
  StreamChunk,
  VectorProvider,
} from '../packages/core/src/types.js';
import {
  assertAIProvider,
  assertMemoryProvider,
  assertVectorProvider,
} from './helpers/interface-assertions.js';

const root = resolve(import.meta.dirname, '..');
const coreSrcDir = resolve(root, 'packages/core/src');

/** Packages @kortex/core must never depend on at compile or runtime. */
const FORBIDDEN_CORE_IMPORTS = [
  '@kortex/config',
  '@kortex/openai',
  '@kortex/anthropic',
  '@kortex/gemini',
  '@kortex/openrouter',
  '@kortex/ollama',
  '@kortex/lmstudio',
  '@kortex/openclaw',
  '@kortex/hermes',
  '@kortex/provider-shared',
  '@kortex/postgres',
  '@kortex/redis',
  '@kortex/pgvector',
  '@kortex/qdrant',
  '@kortex/mcp',
] as const;

const ALLOWED_CORE_IMPORTS = new Set(['@kortex/errors', '@kortex/logger']);

function listTypeScriptSources(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...listTypeScriptSources(path));
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      files.push(path);
    }
  }
  return files;
}

function collectImportSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  const staticImport =
    /(?:import|export)\s+(?:type\s+)?(?:[\w*{}\s,$]+\s+from\s+)?['"]([^'"]+)['"]/g;
  const dynamicImport = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const pattern of [staticImport, dynamicImport]) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
      specifiers.push(match[1]!);
    }
  }

  return specifiers;
}

function createMockAIProvider(): AIProvider {
  return {
    name: 'mock-ai',
    chat: vi.fn(async (): Promise<ChatResponse> => ({
      content: 'mock reply',
      model: 'mock-model',
    })),
    stream: vi.fn(async function* (): AsyncIterable<StreamChunk> {
      yield { content: 'mock', done: false };
      yield { content: '', done: true, model: 'mock-model' };
    }),
    embed: vi.fn(async () => ({
      embeddings: [[0.1, 0.2, 0.3]],
      model: 'mock-embed',
      dimensions: 3,
    })),
    validateConfig: vi.fn(async () => {}),
  };
}

function createMockMemoryProvider(): MemoryProvider {
  return {
    name: 'mock-memory',
    saveMessage: vi.fn(async () => {}),
    getMessages: vi.fn(async () => [{ role: 'user', content: 'prior message' }]),
    saveMemory: vi.fn(async (entry) => ({
      ...entry,
      id: 'mem_1',
      createdAt: new Date(),
    })),
    searchMemory: vi.fn(async () => [
      {
        id: 'mem_1',
        userId: 'user_1',
        content: 'remembered fact',
        createdAt: new Date(),
      } satisfies MemoryEntry,
    ]),
    deleteMemory: vi.fn(async () => {}),
    clearSession: vi.fn(async () => {}),
  };
}

function createMockVectorProvider(): VectorProvider {
  return {
    name: 'mock-vector',
    createIndex: vi.fn(async () => {}),
    upsert: vi.fn(async (records) =>
      records.map((record, index) => ({ ...record, id: `vec_${index}` })),
    ),
    search: vi.fn(async () => [{ id: 'vec_0', content: 'retrieved chunk', score: 0.95 }]),
    delete: vi.fn(async () => {}),
  };
}

describe('architecture boundaries — @kortex/core imports', () => {
  const coreSources = listTypeScriptSources(coreSrcDir);

  it('has production source files to scan', () => {
    expect(coreSources.length).toBeGreaterThan(0);
  });

  it.each(coreSources)('%s does not import forbidden adapter packages', (filePath) => {
    const source = readFileSync(filePath, 'utf8');
    const imports = collectImportSpecifiers(source);

    for (const specifier of imports) {
      if (!specifier.startsWith('@kortex/')) continue;

      expect(FORBIDDEN_CORE_IMPORTS, `${filePath} must not import ${specifier}`).not.toContain(
        specifier,
      );
    }
  });

  it('only allows @kortex/errors and @kortex/logger from workspace packages', () => {
    const workspaceImports = new Set<string>();

    for (const filePath of coreSources) {
      const source = readFileSync(filePath, 'utf8');
      for (const specifier of collectImportSpecifiers(source)) {
        if (specifier.startsWith('@kortex/')) {
          workspaceImports.add(specifier);
        }
      }
    }

    for (const specifier of workspaceImports) {
      expect(ALLOWED_CORE_IMPORTS.has(specifier), `unexpected @kortex import: ${specifier}`).toBe(
        true,
      );
    }
  });

  it('package.json does not declare forbidden dependencies', () => {
    const pkg = JSON.parse(readFileSync(resolve(coreSrcDir, '../package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      optionalDependencies?: Record<string, string>;
    };

    const declared = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
      ...Object.keys(pkg.optionalDependencies ?? {}),
    ];

    for (const name of declared) {
      expect(FORBIDDEN_CORE_IMPORTS, `forbidden dependency: ${name}`).not.toContain(name);
    }
  });
});

describe('architecture boundaries — KortexRuntime with mocked adapters', () => {
  it('orchestrates chat, memory, and vector retrieval without concrete adapters', async () => {
    const provider = createMockAIProvider();
    const memory = createMockMemoryProvider();
    const vector = createMockVectorProvider();

    const runtime = new KortexRuntime({ provider, memory, vector });

    const chatResponse = await runtime.chat({
      userId: 'user_1',
      sessionId: 'session_1',
      message: 'What do you know?',
      useMemory: true,
      useRag: true,
    });

    expect(chatResponse.content).toBe('mock reply');
    expect(provider.chat).toHaveBeenCalled();
    expect(memory.getMessages).toHaveBeenCalled();
    expect(provider.embed).toHaveBeenCalled();
    expect(vector.search).toHaveBeenCalled();
    expect(memory.saveMessage).toHaveBeenCalled();

    const remembered = await runtime.remember({
      userId: 'user_1',
      content: 'prefers concise answers',
    });
    expect(remembered.id).toBe('mem_1');

    const context = await runtime.retrieveContext({
      query: 'preferences',
      userId: 'user_1',
    });
    expect(context.chunks[0]?.content).toBe('retrieved chunk');
  });
});

describe('architecture boundaries — AI provider packages', () => {
  const aiProviders = [
    {
      label: '@kortex/openai',
      load: () => import('../packages/providers/openai/src/openai-provider.js'),
      exportName: 'OpenAIProvider',
      create: (mod: { OpenAIProvider: new (config: { apiKey: string }) => AIProvider }) =>
        new mod.OpenAIProvider({ apiKey: 'sk-test' }),
    },
    {
      label: '@kortex/anthropic',
      load: () => import('../packages/providers/anthropic/src/index.js'),
      exportName: 'AnthropicProvider',
      create: (mod: { AnthropicProvider: new (config: { apiKey: string }) => AIProvider }) =>
        new mod.AnthropicProvider({ apiKey: 'sk-test' }),
    },
    {
      label: '@kortex/gemini',
      load: () => import('../packages/providers/gemini/src/index.js'),
      exportName: 'GeminiProvider',
      create: (mod: { GeminiProvider: new (config: { apiKey: string }) => AIProvider }) =>
        new mod.GeminiProvider({ apiKey: 'test-key' }),
    },
    {
      label: '@kortex/openrouter',
      load: () => import('../packages/providers/openrouter/src/index.js'),
      exportName: 'OpenRouterProvider',
      create: (mod: { OpenRouterProvider: new (config: { apiKey: string }) => AIProvider }) =>
        new mod.OpenRouterProvider({ apiKey: 'sk-test' }),
    },
    {
      label: '@kortex/ollama',
      load: () => import('../packages/providers/ollama/src/index.js'),
      exportName: 'OllamaProvider',
      create: (mod: { OllamaProvider: new (config?: object) => AIProvider }) =>
        new mod.OllamaProvider({ baseUrl: 'http://localhost:11434' }),
    },
    {
      label: '@kortex/lmstudio',
      load: () => import('../packages/providers/lmstudio/src/index.js'),
      exportName: 'LMStudioProvider',
      create: (mod: { LMStudioProvider: new (config?: object) => AIProvider }) =>
        new mod.LMStudioProvider({ baseUrl: 'http://localhost:1234' }),
    },
    {
      label: '@kortex/openclaw',
      load: () => import('../packages/providers/openclaw/src/index.js'),
      exportName: 'OpenClawProvider',
      create: (mod: { OpenClawProvider: new (config?: object) => AIProvider }) =>
        new mod.OpenClawProvider({ baseUrl: 'http://localhost:18789' }),
    },
    {
      label: '@kortex/hermes',
      load: () => import('../packages/providers/hermes/src/index.js'),
      exportName: 'HermesProvider',
      create: (mod: { HermesProvider: new (config?: object) => AIProvider }) =>
        new mod.HermesProvider({ baseUrl: 'http://localhost:3000' }),
    },
  ] as const;

  it.each(aiProviders)('$label implements AIProvider', async ({ load, exportName, create }) => {
    const mod = await load();
    const Provider = mod[exportName as keyof typeof mod] as new (...args: never[]) => unknown;
    expect(Provider).toBeDefined();
    assertAIProvider(create(mod as never));
  });
});

describe('architecture boundaries — memory provider packages', () => {
  const memoryProviders = [
    {
      label: '@kortex/postgres',
      load: () => import('../packages/memory/postgres/src/index.js'),
      exportName: 'PostgresMemoryProvider',
      create: (mod: {
        PostgresMemoryProvider: new (config: { databaseUrl: string }) => MemoryProvider;
      }) => new mod.PostgresMemoryProvider({ databaseUrl: 'postgresql://localhost/kortex' }),
    },
    {
      label: '@kortex/redis',
      load: () => import('../packages/memory/redis/src/index.js'),
      exportName: 'RedisMemoryProvider',
      create: (mod: { RedisMemoryProvider: new (config: { url: string }) => MemoryProvider }) =>
        new mod.RedisMemoryProvider({ url: 'redis://localhost:6379' }),
    },
  ] as const;

  it.each(memoryProviders)(
    '$label implements MemoryProvider',
    async ({ load, exportName, create }) => {
      const mod = await load();
      const Provider = mod[exportName as keyof typeof mod];
      expect(Provider).toBeDefined();
      assertMemoryProvider(create(mod as never));
    },
  );
});

describe('architecture boundaries — @kortex/ui imports', () => {
  const uiSrcDir = resolve(root, 'packages/ui/src');
  const uiSources = listTypeScriptSources(uiSrcDir);

  const FORBIDDEN_UI_IMPORTS = [
    '@kortex/config',
    '@kortex/core',
    '@kortex/openai',
    '@kortex/anthropic',
    '@kortex/postgres',
    '@kortex/redis',
    '@kortex/pgvector',
    '@kortex/qdrant',
    '@kortex/mcp',
    '@kortex/agents',
    '@kortex/tools',
  ] as const;

  it.each(uiSources)('%s does not import backend adapter packages', (filePath) => {
    const source = readFileSync(filePath, 'utf8');
    for (const specifier of collectImportSpecifiers(source)) {
      if (!specifier.startsWith('@kortex/')) continue;
      expect(FORBIDDEN_UI_IMPORTS, `${filePath} must not import ${specifier}`).not.toContain(
        specifier,
      );
    }
  });
});

describe('architecture boundaries — vector provider packages', () => {
  const vectorProviders = [
    {
      label: '@kortex/pgvector',
      load: () => import('../packages/vector/pgvector/src/index.js'),
      exportName: 'PgVectorProvider',
      create: (mod: {
        PgVectorProvider: new (config: { databaseUrl: string }) => VectorProvider;
      }) => new mod.PgVectorProvider({ databaseUrl: 'postgresql://localhost/kortex' }),
    },
    {
      label: '@kortex/qdrant',
      load: () => import('../packages/vector/qdrant/src/index.js'),
      exportName: 'QdrantVectorProvider',
      create: (mod: { QdrantVectorProvider: new (config: { url: string }) => VectorProvider }) =>
        new mod.QdrantVectorProvider({ url: 'http://localhost:6333' }),
    },
  ] as const;

  it.each(vectorProviders)(
    '$label implements VectorProvider',
    async ({ load, exportName, create }) => {
      const mod = await load();
      const Provider = mod[exportName as keyof typeof mod];
      expect(Provider).toBeDefined();
      assertVectorProvider(create(mod as never));
    },
  );
});
