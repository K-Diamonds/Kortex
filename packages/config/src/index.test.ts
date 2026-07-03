import { describe, it, expect } from 'vitest';
import { loadConfig, validateConfig, getModelForProvider } from './index.js';

describe('@kortex/config', () => {
  it('loads OpenAI defaults', () => {
    const config = loadConfig({
      AI_PROVIDER: 'openai',
      OPENAI_API_KEY: 'sk-test',
    } as NodeJS.ProcessEnv);

    expect(config.aiProvider).toBe('openai');
    expect(config.openai.model).toBe('gpt-4o-mini');
    expect(config.memoryProvider).toBe('none');
    expect(config.vectorProvider).toBe('none');
    expect(config.embeddingDimensions).toBe(1536);
  });

  it('uses AI_MODEL override', () => {
    const config = loadConfig({
      AI_PROVIDER: 'openai',
      AI_MODEL: 'gpt-4o',
      OPENAI_API_KEY: 'sk-test',
    } as NodeJS.ProcessEnv);

    expect(getModelForProvider(config)).toBe('gpt-4o');
  });

  it('loads ollama provider config', () => {
    const config = loadConfig({
      AI_PROVIDER: 'ollama',
      EMBEDDING_PROVIDER: 'provider',
      OLLAMA_BASE_URL: 'http://localhost:11434',
    } as NodeJS.ProcessEnv);

    expect(config.aiProvider).toBe('ollama');
    expect(config.ollama.baseUrl).toBe('http://localhost:11434');
    expect(() => validateConfig(config)).not.toThrow();
  });

  it('requires OPENAI_API_KEY for openai', () => {
    const config = loadConfig({ AI_PROVIDER: 'openai' } as NodeJS.ProcessEnv);
    expect(() => validateConfig(config)).toThrow('OPENAI_API_KEY');
  });

  it('requires DATABASE_URL when memory is postgres', () => {
    const config = loadConfig({
      AI_PROVIDER: 'openai',
      OPENAI_API_KEY: 'sk-test',
      MEMORY_PROVIDER: 'postgres',
    } as NodeJS.ProcessEnv);
    expect(() => validateConfig(config)).toThrow('DATABASE_URL');
  });

  it('does not require DATABASE_URL for chat-only', () => {
    const config = loadConfig({
      AI_PROVIDER: 'openai',
      OPENAI_API_KEY: 'sk-test',
      MEMORY_PROVIDER: 'none',
      VECTOR_PROVIDER: 'none',
    } as NodeJS.ProcessEnv);
    expect(() => validateConfig(config)).not.toThrow();
  });

  it('loads EMBEDDING_DIMENSIONS for pgvector', () => {
    const config = loadConfig({
      AI_PROVIDER: 'openai',
      OPENAI_API_KEY: 'sk-test',
      VECTOR_PROVIDER: 'pgvector',
      DATABASE_URL: 'postgresql://localhost/kortex',
      EMBEDDING_DIMENSIONS: '3072',
    } as NodeJS.ProcessEnv);
    expect(config.embeddingDimensions).toBe(3072);
    expect(() => validateConfig(config)).not.toThrow();
  });

  it('rejects invalid EMBEDDING_DIMENSIONS', () => {
    expect(() =>
      loadConfig({
        EMBEDDING_DIMENSIONS: 'bad',
      } as NodeJS.ProcessEnv),
    ).toThrow('EMBEDDING_DIMENSIONS');
  });
});
