import type { Logger } from '@kortex/logger';

export type Role = 'system' | 'user' | 'assistant' | 'tool';

export interface Message {
  role: Role;
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface ChatOptions {
  messages: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
  sessionId?: string;
  tools?: ToolDefinition[];
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: ToolCall[];
  finishReason?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  model?: string;
  usage?: ChatResponse['usage'];
}

export interface EmbedOptions {
  input: string | string[];
  model?: string;
}

export interface EmbedResponse {
  embeddings: number[][];
  model: string;
  dimensions: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown> | unknown;

export interface AIProvider {
  readonly name: string;
  chat(options: ChatOptions): Promise<ChatResponse>;
  stream(options: ChatOptions): AsyncIterable<StreamChunk>;
  embed(options: EmbedOptions): Promise<EmbedResponse>;
  validateConfig(): Promise<void>;
}

export interface MemoryEntry {
  id: string;
  userId: string;
  sessionId?: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface MemorySearchOptions {
  userId: string;
  sessionId?: string;
  query: string;
  limit?: number;
}

export interface MemoryProvider {
  readonly name: string;
  saveMessage(message: Message & { userId: string; sessionId: string }): Promise<void>;
  getMessages(userId: string, sessionId: string): Promise<Message[]>;
  saveMemory(entry: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<MemoryEntry>;
  searchMemory(options: MemorySearchOptions): Promise<MemoryEntry[]>;
  deleteMemory(id: string): Promise<void>;
  clearSession(userId: string, sessionId: string): Promise<void>;
}

export interface VectorRecord {
  id: string;
  embedding: number[];
  content: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

export interface VectorIndexOptions {
  name?: string;
  dimensions?: number;
  metric?: 'cosine' | 'euclidean' | 'dot';
}

export interface VectorSearchOptions {
  embedding: number[];
  limit?: number;
  userId?: string;
  sessionId?: string;
  filter?: Record<string, unknown>;
  minScore?: number;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface VectorProvider {
  readonly name: string;
  createIndex(options?: VectorIndexOptions): Promise<void>;
  upsert(records: Omit<VectorRecord, 'id'>[]): Promise<VectorRecord[]>;
  search(options: VectorSearchOptions): Promise<VectorSearchResult[]>;
  delete(ids: string[]): Promise<void>;
}

export interface EmbedDocumentOptions {
  model?: string;
}

export interface EmbeddingProvider {
  readonly name: string;
  embedText(text: string, options?: EmbedDocumentOptions): Promise<number[]>;
  embedDocuments(texts: string[], options?: EmbedDocumentOptions): Promise<number[][]>;
}

export interface ToolProvider {
  readonly name: string;
  registerTool(tool: ToolDefinition, handler: ToolHandler): void;
  listTools(): Promise<ToolDefinition[]>;
  executeTool(name: string, args: Record<string, unknown>): Promise<unknown>;
}

export interface AgentContext {
  userId?: string;
  sessionId?: string;
  instructions?: string;
  tools?: ToolDefinition[];
}

export interface Agent {
  readonly id: string;
  readonly name: string;
  readonly instructions: string;
  run(input: string, context?: AgentContext): Promise<ChatResponse>;
  stream(input: string, context?: AgentContext): AsyncIterable<StreamChunk>;
}

export interface AgentConfig {
  id?: string;
  name: string;
  instructions: string;
  useMemory?: boolean;
  useRag?: boolean;
  tools?: ToolDefinition[];
}

export interface AgentProvider {
  readonly name: string;
  createAgent(config: AgentConfig): Promise<Agent>;
  runAgent(agentId: string, input: string, context?: AgentContext): Promise<ChatResponse>;
}

export interface RAGDocument {
  id?: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface RAGChunk {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
}

export interface DocumentLoadOptions {
  metadata?: Record<string, unknown>;
}

export interface DocumentLoader {
  readonly name: string;
  load(source: string, options?: DocumentLoadOptions): Promise<RAGDocument[]>;
  chunk(document: RAGDocument, options?: { chunkSize?: number; chunkOverlap?: number }): RAGChunk[];
}

export interface RuntimeConfig {
  provider: AIProvider;
  memory?: MemoryProvider;
  vector?: VectorProvider;
  embedding?: EmbeddingProvider;
  tools?: ToolProvider[];
  agents?: AgentProvider;
  logger?: Logger;
}

export interface RuntimeChatRequest {
  userId: string;
  sessionId: string;
  message: string;
  model?: string;
  useMemory?: boolean;
  useRag?: boolean;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface RuntimeChatResponse extends ChatResponse {
  retrievedContext?: RetrievedContext;
  toolResults?: Array<{ name: string; output: unknown }>;
}

export interface RetrieveContextOptions {
  query: string;
  userId?: string;
  sessionId?: string;
  limit?: number;
}

export interface RetrievedContext {
  chunks: VectorSearchResult[];
  query: string;
}

export interface IngestRequest {
  documents: RAGDocument[];
  userId?: string;
  sessionId?: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

export { KortexError } from '@kortex/errors';
