import { expect } from 'vitest';
import type { AIProvider, MemoryProvider, VectorProvider } from '../../packages/core/src/types.js';

export function assertAIProvider(instance: unknown): asserts instance is AIProvider {
  const provider = instance as AIProvider;
  expect(provider.name).toEqual(expect.any(String));
  expect(provider.chat).toEqual(expect.any(Function));
  expect(provider.stream).toEqual(expect.any(Function));
  expect(provider.embed).toEqual(expect.any(Function));
  expect(provider.validateConfig).toEqual(expect.any(Function));
}

export function assertMemoryProvider(instance: unknown): asserts instance is MemoryProvider {
  const memory = instance as MemoryProvider;
  expect(memory.name).toEqual(expect.any(String));
  expect(memory.saveMessage).toEqual(expect.any(Function));
  expect(memory.getMessages).toEqual(expect.any(Function));
  expect(memory.saveMemory).toEqual(expect.any(Function));
  expect(memory.searchMemory).toEqual(expect.any(Function));
  expect(memory.deleteMemory).toEqual(expect.any(Function));
  expect(memory.clearSession).toEqual(expect.any(Function));
}

export function assertVectorProvider(instance: unknown): asserts instance is VectorProvider {
  const vector = instance as VectorProvider;
  expect(vector.name).toEqual(expect.any(String));
  expect(vector.createIndex).toEqual(expect.any(Function));
  expect(vector.upsert).toEqual(expect.any(Function));
  expect(vector.search).toEqual(expect.any(Function));
  expect(vector.delete).toEqual(expect.any(Function));
}
