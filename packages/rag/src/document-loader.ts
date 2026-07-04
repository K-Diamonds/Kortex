import type { DocumentLoader, DocumentLoadOptions, RAGChunk, RAGDocument } from '@kortex/core';
import { chunkDocuments } from './index.js';

export class TextDocumentLoader implements DocumentLoader {
  readonly name = 'text';

  async load(source: string, options?: DocumentLoadOptions): Promise<RAGDocument[]> {
    return [
      {
        id: options?.metadata?.id as string | undefined,
        content: source,
        metadata: options?.metadata,
      },
    ];
  }

  chunk(
    document: RAGDocument,
    options?: { chunkSize?: number; chunkOverlap?: number },
  ): RAGChunk[] {
    return chunkDocuments([document], options);
  }
}

export class FileDocumentLoader implements DocumentLoader {
  readonly name = 'file';

  async load(source: string, options?: DocumentLoadOptions): Promise<RAGDocument[]> {
    const { readFile } = await import('node:fs/promises');
    const content = await readFile(source, 'utf8');
    return [{ content, metadata: { ...options?.metadata, path: source } }];
  }

  chunk(
    document: RAGDocument,
    options?: { chunkSize?: number; chunkOverlap?: number },
  ): RAGChunk[] {
    return chunkDocuments([document], options);
  }
}
