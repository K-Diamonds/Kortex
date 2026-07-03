import { randomUUID } from 'node:crypto';
import type { MemoryEntry, MemoryProvider, MemorySearchOptions, Message } from '@kortex/core';
import { createClient, type RedisClientType } from 'redis';

export interface RedisMemoryOptions {
  url: string;
  keyPrefix?: string;
}

export class RedisMemoryProvider implements MemoryProvider {
  readonly name = 'redis';
  private readonly client: RedisClientType;
  private readonly prefix: string;
  private connectPromise: Promise<void> | null = null;

  constructor(options: RedisMemoryOptions) {
    if (!options.url) throw new Error('RedisMemoryProvider requires url');
    this.prefix = options.keyPrefix ?? 'kortex';
    this.client = createClient({ url: options.url });
  }

  private async ensureConnected(): Promise<void> {
    this.connectPromise ??= this.client.connect().then(() => undefined);
    return this.connectPromise;
  }

  private messagesKey(userId: string, sessionId: string): string {
    return `${this.prefix}:messages:${userId}:${sessionId}`;
  }

  private memoriesKey(userId: string): string {
    return `${this.prefix}:memories:${userId}`;
  }

  async saveMessage(message: Message & { userId: string; sessionId: string }): Promise<void> {
    await this.ensureConnected();
    const key = this.messagesKey(message.userId, message.sessionId);
    await this.client.rPush(key, JSON.stringify({ role: message.role, content: message.content }));
  }

  async getMessages(userId: string, sessionId: string): Promise<Message[]> {
    await this.ensureConnected();
    const rows = await this.client.lRange(this.messagesKey(userId, sessionId), 0, -1);
    return rows.map((row) => JSON.parse(row) as Message);
  }

  async saveMemory(entry: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<MemoryEntry> {
    await this.ensureConnected();
    const id = randomUUID();
    const createdAt = new Date();
    const record: MemoryEntry = { ...entry, id, createdAt };
    await this.client.hSet(this.memoriesKey(entry.userId), id, JSON.stringify(record));
    return record;
  }

  async searchMemory(options: MemorySearchOptions): Promise<MemoryEntry[]> {
    await this.ensureConnected();
    const all = await this.client.hGetAll(this.memoriesKey(options.userId));
    const query = options.query.toLowerCase();
    const limit = options.limit ?? 10;

    return Object.values(all)
      .map((raw) => JSON.parse(raw) as MemoryEntry)
      .filter((entry) => {
        if (options.sessionId && entry.sessionId !== options.sessionId) return false;
        return entry.content.toLowerCase().includes(query);
      })
      .slice(0, limit);
  }

  async deleteMemory(id: string): Promise<void> {
    await this.ensureConnected();
    const keys = await this.client.keys(`${this.prefix}:memories:*`);
    for (const key of keys) {
      await this.client.hDel(key, id);
    }
  }

  async clearSession(userId: string, sessionId: string): Promise<void> {
    await this.ensureConnected();
    await this.client.del(this.messagesKey(userId, sessionId));
  }
}
