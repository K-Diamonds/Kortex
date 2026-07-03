import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    externalId: text('external_id'),
    email: text('email'),
    name: text('name'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_external_id_unique').on(table.externalId),
    index('users_external_id_idx').on(table.externalId),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    externalId: text('external_id'),
    title: text('title'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    uniqueIndex('sessions_user_external_id_unique').on(table.userId, table.externalId),
  ],
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    content: text('content').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('messages_session_id_idx').on(table.sessionId),
    index('messages_user_id_idx').on(table.userId),
  ],
);

export const memories = pgTable(
  'memories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
    content: text('content').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('memories_user_id_idx').on(table.userId),
    index('memories_session_id_idx').on(table.sessionId),
  ],
);

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title'),
    source: text('source'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('documents_user_id_idx').on(table.userId)],
);

export const documentChunks = pgTable(
  'document_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    chunkIndex: integer('chunk_index').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('document_chunks_document_id_idx').on(table.documentId),
    index('document_chunks_chunk_index_idx').on(table.documentId, table.chunkIndex),
  ],
);

export const embeddings = pgTable(
  'embeddings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id'),
    sessionId: text('session_id'),
    content: text('content').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    embedding: vector('embedding', { dimensions: 1536 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('embeddings_user_id_idx').on(table.userId),
    index('embeddings_session_id_idx').on(table.sessionId),
    index('embeddings_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
  ],
);

export const toolRuns = pgTable(
  'tool_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
    toolName: text('tool_name').notNull(),
    input: jsonb('input').$type<Record<string, unknown>>().default({}).notNull(),
    output: jsonb('output').$type<unknown>(),
    error: text('error'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('tool_runs_user_id_idx').on(table.userId),
    index('tool_runs_session_id_idx').on(table.sessionId),
    index('tool_runs_tool_name_idx').on(table.toolName),
  ],
);

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
    agentId: text('agent_id').notNull(),
    agentName: text('agent_name').notNull(),
    input: text('input').notNull(),
    output: text('output'),
    status: text('status').notNull().default('completed'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('agent_runs_user_id_idx').on(table.userId),
    index('agent_runs_session_id_idx').on(table.sessionId),
    index('agent_runs_agent_id_idx').on(table.agentId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  messages: many(messages),
  memories: many(memories),
  documents: many(documents),
  toolRuns: many(toolRuns),
  agentRuns: many(agentRuns),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  messages: many(messages),
  memories: many(memories),
  toolRuns: many(toolRuns),
  agentRuns: many(agentRuns),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, { fields: [documents.userId], references: [users.id] }),
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));

export const schema = {
  users,
  sessions,
  messages,
  memories,
  documents,
  documentChunks,
  embeddings,
  toolRuns,
  agentRuns,
};
