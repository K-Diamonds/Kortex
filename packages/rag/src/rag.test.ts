import { describe, it, expect } from 'vitest';
import { chunkDocuments, chunkText } from './index.js';

describe('RAG chunking', () => {
  it('splits text into sized chunks', () => {
    const text = 'a'.repeat(2500);
    const chunks = chunkText(text, { chunkSize: 1000, chunkOverlap: 200 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toHaveLength(1000);
  });

  it('chunks multiple documents', () => {
    const chunks = chunkDocuments(
      [
        { id: 'a', content: 'Hello world' },
        { id: 'b', content: 'Second doc' },
      ],
      { chunkSize: 100 },
    );
    expect(chunks).toHaveLength(2);
    expect(chunks[0]?.metadata?.sourceId).toBe('a');
  });
});
