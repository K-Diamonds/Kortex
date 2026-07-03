import { randomUUID } from 'node:crypto';
import type {
  VectorIndexOptions,
  VectorProvider,
  VectorRecord,
  VectorSearchOptions,
  VectorSearchResult,
} from '@kortex/core';
import { QdrantClient } from '@qdrant/js-client-rest';

export interface QdrantVectorOptions {
  url: string;
  apiKey?: string;
  collection?: string;
}

export class QdrantVectorProvider implements VectorProvider {
  readonly name = 'qdrant';
  private readonly client: QdrantClient;
  private readonly collection: string;
  private dimensions = 1536;

  constructor(options: QdrantVectorOptions) {
    this.client = new QdrantClient({ url: options.url, apiKey: options.apiKey });
    this.collection = options.collection ?? 'kortex_embeddings';
  }

  async createIndex(options?: VectorIndexOptions): Promise<void> {
    this.dimensions = options?.dimensions ?? this.dimensions;
    const collections = await this.client.getCollections();
    const exists = collections.collections.some((c) => c.name === this.collection);
    if (exists) return;

    await this.client.createCollection(this.collection, {
      vectors: {
        size: this.dimensions,
        distance: options?.metric === 'euclidean' ? 'Euclid' : 'Cosine',
      },
    });
  }

  async upsert(records: Omit<VectorRecord, 'id'>[]): Promise<VectorRecord[]> {
    if (records.length === 0) return [];
    const firstDim = records[0]?.embedding.length ?? this.dimensions;
    await this.createIndex({ dimensions: firstDim });

    const results: VectorRecord[] = [];
    const points = records.map((record) => {
      const id = randomUUID();
      results.push({ ...record, id });
      return {
        id,
        vector: record.embedding,
        payload: {
          content: record.content,
          metadata: record.metadata,
          userId: record.userId,
          sessionId: record.sessionId,
        },
      };
    });

    await this.client.upsert(this.collection, { points });
    return results;
  }

  async search(options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    await this.createIndex();
    const filter = options.userId
      ? {
          must: [
            { key: 'userId', match: { value: options.userId } },
            ...(options.sessionId
              ? [{ key: 'sessionId', match: { value: options.sessionId } }]
              : []),
          ],
        }
      : undefined;

    const results = await this.client.search(this.collection, {
      vector: options.embedding,
      limit: options.limit ?? 5,
      filter,
    });

    return results
      .map((row) => ({
        id: String(row.id),
        content: String(row.payload?.content ?? ''),
        score: row.score ?? 0,
        metadata: row.payload?.metadata as Record<string, unknown> | undefined,
      }))
      .filter((row) => row.score >= (options.minScore ?? 0));
  }

  async delete(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.client.delete(this.collection, { points: ids });
  }
}
