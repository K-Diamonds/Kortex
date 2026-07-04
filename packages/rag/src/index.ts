import { randomUUID } from 'node:crypto';
import type { KortexRuntime, RAGChunk, RAGDocument, VectorSearchResult } from '@kortex/core';
import { createLogger } from '@kortex/logger';

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface IngestOptions extends ChunkOptions {
  userId?: string;
  sessionId?: string;
}

export interface RetrieveOptions {
  query: string;
  userId?: string;
  sessionId?: string;
  limit?: number;
}

const logger = createLogger({ name: 'kortex-rag' });

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const chunkSize = options.chunkSize ?? 1000;
  const overlap = options.chunkOverlap ?? 200;
  const chunks: string[] = [];

  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end >= text.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
}

export function chunkDocuments(documents: RAGDocument[], options: ChunkOptions = {}): RAGChunk[] {
  const chunks: RAGChunk[] = [];

  for (const doc of documents) {
    const texts = chunkText(doc.content, options);
    for (const text of texts) {
      chunks.push({
        id: randomUUID(),
        content: text,
        metadata: { ...doc.metadata, sourceId: doc.id },
      });
    }
  }

  return chunks;
}

export class RAGPipeline {
  constructor(private readonly runtime: KortexRuntime) {}

  async ingest(documents: RAGDocument[], options: IngestOptions = {}): Promise<RAGChunk[]> {
    const chunks = chunkDocuments(documents, options);
    logger.info('ingesting documents', {
      documentCount: documents.length,
      chunkCount: chunks.length,
    });

    if (!this.runtime.vector) {
      throw new Error('Vector provider required for RAG ingest');
    }

    const texts = chunks.map((c) => c.content);
    const { embeddings } = await this.runtime.embed({ input: texts });

    const records = chunks.map((chunk, i) => ({
      content: chunk.content,
      embedding: embeddings[i] ?? [],
      metadata: chunk.metadata,
      userId: options.userId,
      sessionId: options.sessionId,
    }));

    const stored = await this.runtime.vector.upsert(records);

    return stored.map((record, i) => ({
      ...chunks[i]!,
      id: record.id,
      embedding: record.embedding,
    }));
  }

  async retrieve(options: RetrieveOptions): Promise<VectorSearchResult[]> {
    const context = await this.runtime.retrieveContext({
      query: options.query,
      userId: options.userId,
      sessionId: options.sessionId,
      limit: options.limit,
    });

    return context.chunks;
  }
}

export { chunkText as chunk };
export { TextDocumentLoader, FileDocumentLoader } from './document-loader.js';
