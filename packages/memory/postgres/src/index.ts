import { randomUUID } from 'node:crypto';
import { ensureKortexSchema } from '@kortex/db';
import type { MemoryEntry, MemoryProvider, MemorySearchOptions, Message } from '@kortex/core';
import { createLogger } from '@kortex/logger';
import pg from 'pg';

export interface PostgresMemoryOptions {
  connectionString?: string;
  databaseUrl?: string;
}

export class PostgresMemoryProvider implements MemoryProvider {
  readonly name = 'postgres';
  private readonly pool: pg.Pool;
  private readonly logger = createLogger({ name: 'kortex-postgres' });
  private schemaReady: Promise<void> | null = null;

  constructor(options: PostgresMemoryOptions) {
    const connectionString = options.databaseUrl ?? options.connectionString;
    if (!connectionString) {
      throw new Error('PostgresMemoryProvider requires connectionString or databaseUrl');
    }
    this.pool = new pg.Pool({ connectionString });
  }

  private ensureSchema(): Promise<void> {
    this.schemaReady ??= ensureKortexSchema(this.pool).then(() => undefined);
    return this.schemaReady;
  }

  private async resolveUserId(externalId: string): Promise<string> {
    const existing = await this.pool.query<{ id: string }>(
      `SELECT id FROM users WHERE external_id = $1`,
      [externalId],
    );
    if (existing.rows[0]) return existing.rows[0].id;

    const inserted = await this.pool.query<{ id: string }>(
      `INSERT INTO users (external_id) VALUES ($1) RETURNING id`,
      [externalId],
    );
    return inserted.rows[0]!.id;
  }

  private async resolveSessionId(userId: string, externalId: string): Promise<string> {
    const existing = await this.pool.query<{ id: string }>(
      `SELECT id FROM sessions WHERE user_id = $1 AND external_id = $2`,
      [userId, externalId],
    );
    if (existing.rows[0]) return existing.rows[0].id;

    const inserted = await this.pool.query<{ id: string }>(
      `INSERT INTO sessions (user_id, external_id) VALUES ($1, $2) RETURNING id`,
      [userId, externalId],
    );
    return inserted.rows[0]!.id;
  }

  async saveMessage(message: Message & { userId: string; sessionId: string }): Promise<void> {
    await this.ensureSchema();
    const userId = await this.resolveUserId(message.userId);
    const sessionId = await this.resolveSessionId(userId, message.sessionId);

    await this.pool.query(
      `INSERT INTO messages (id, user_id, session_id, role, content)
       VALUES ($1, $2, $3, $4, $5)`,
      [randomUUID(), userId, sessionId, message.role, message.content],
    );
  }

  async getMessages(userId: string, sessionId: string): Promise<Message[]> {
    await this.ensureSchema();
    const internalUserId = await this.resolveUserId(userId);
    const internalSessionId = await this.resolveSessionId(internalUserId, sessionId);

    const result = await this.pool.query<{ role: string; content: string }>(
      `SELECT role, content FROM messages
       WHERE user_id = $1 AND session_id = $2
       ORDER BY created_at ASC`,
      [internalUserId, internalSessionId],
    );

    return result.rows.map((row) => ({
      role: row.role as Message['role'],
      content: row.content,
    }));
  }

  async saveMemory(entry: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<MemoryEntry> {
    await this.ensureSchema();
    const userId = await this.resolveUserId(entry.userId);
    const sessionId = entry.sessionId ? await this.resolveSessionId(userId, entry.sessionId) : null;

    const id = randomUUID();
    const createdAt = new Date();

    await this.pool.query(
      `INSERT INTO memories (id, user_id, session_id, content, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $6)`,
      [id, userId, sessionId, entry.content, JSON.stringify(entry.metadata ?? {}), createdAt],
    );

    return { ...entry, id, createdAt };
  }

  async searchMemory(options: MemorySearchOptions): Promise<MemoryEntry[]> {
    await this.ensureSchema();
    const userId = await this.resolveUserId(options.userId);
    const sessionId = options.sessionId
      ? await this.resolveSessionId(userId, options.sessionId)
      : null;
    const limit = options.limit ?? 10;

    const result = await this.pool.query(
      `SELECT id, user_id, session_id, content, metadata, created_at
       FROM memories
       WHERE user_id = $1
         AND ($2::uuid IS NULL OR session_id = $2)
         AND content ILIKE $3
       ORDER BY created_at DESC
       LIMIT $4`,
      [userId, sessionId, `%${options.query}%`, limit],
    );

    return result.rows.map((row) => ({
      id: row.id,
      userId: options.userId,
      sessionId: options.sessionId,
      content: row.content,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.created_at,
    }));
  }

  async deleteMemory(id: string): Promise<void> {
    await this.ensureSchema();
    await this.pool.query(`DELETE FROM memories WHERE id = $1`, [id]);
    this.logger.debug('memory deleted', { id });
  }

  async clearSession(userId: string, sessionId: string): Promise<void> {
    await this.ensureSchema();
    const internalUserId = await this.resolveUserId(userId);
    const internalSessionId = await this.resolveSessionId(internalUserId, sessionId);
    await this.pool.query(`DELETE FROM messages WHERE user_id = $1 AND session_id = $2`, [
      internalUserId,
      internalSessionId,
    ]);
  }
}

/** @deprecated Use `new PostgresMemoryProvider()` */
export function createPostgresMemoryProvider(
  options: PostgresMemoryOptions,
): PostgresMemoryProvider {
  return new PostgresMemoryProvider(options);
}
