import type { Logger } from '@kortex/logger';
import { createLogger } from '@kortex/logger';
import { KortexError } from '@kortex/errors';
import type {
  AgentContext,
  AgentProvider,
  AIProvider,
  ChatOptions,
  ChatResponse,
  EmbedOptions,
  EmbedResponse,
  EmbeddingProvider,
  IngestRequest,
  MemoryEntry,
  MemoryProvider,
  MemorySearchOptions,
  Message,
  RAGChunk,
  RetrieveContextOptions,
  RetrievedContext,
  RuntimeChatRequest,
  RuntimeChatResponse,
  RuntimeConfig,
  StreamChunk,
  ToolProvider,
  VectorProvider,
} from './types.js';

export type KortexRuntimeOptions = RuntimeConfig;

function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
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

export class KortexRuntime {
  readonly provider: AIProvider;
  readonly memory?: MemoryProvider;
  readonly vector?: VectorProvider;
  readonly embedding?: EmbeddingProvider;
  readonly tools: ToolProvider[];
  readonly agents?: AgentProvider;
  private readonly logger: Logger;

  constructor(options: KortexRuntimeOptions) {
    this.provider = options.provider;
    this.memory = options.memory;
    this.vector = options.vector;
    this.embedding = options.embedding;
    this.tools = options.tools ?? [];
    this.agents = options.agents;
    this.logger = options.logger ?? createLogger({ name: 'kortex' });
  }

  async chat(request: RuntimeChatRequest): Promise<RuntimeChatResponse> {
    const { messages, retrievedContext } = await this.buildConversation(request);
    const response = await this.complete({
      messages,
      model: request.model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      userId: request.userId,
      sessionId: request.sessionId,
    });

    if (request.useMemory !== false && this.memory) {
      await this.persistTurn(request.userId, request.sessionId, request.message, response.content);
    }

    return retrievedContext ? { ...response, retrievedContext } : response;
  }

  async *stream(request: RuntimeChatRequest): AsyncIterable<StreamChunk> {
    const { messages } = await this.buildConversation(request);
    let fullContent = '';

    for await (const chunk of this.streamComplete({
      messages,
      model: request.model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      userId: request.userId,
      sessionId: request.sessionId,
    })) {
      fullContent += chunk.content;
      yield chunk;
    }

    if (request.useMemory !== false && this.memory && fullContent) {
      await this.persistTurn(request.userId, request.sessionId, request.message, fullContent);
    }
  }

  async complete(options: ChatOptions): Promise<ChatResponse> {
    try {
      return await this.provider.chat(options);
    } catch (error) {
      this.logger.error('chat failed', error, { provider: this.provider.name });
      throw new KortexError('Chat request failed', 'CHAT_ERROR', error);
    }
  }

  async *streamComplete(options: ChatOptions): AsyncIterable<StreamChunk> {
    try {
      yield* this.provider.stream(options);
    } catch (error) {
      this.logger.error('stream failed', error, { provider: this.provider.name });
      throw new KortexError('Stream request failed', 'STREAM_ERROR', error);
    }
  }

  async embed(options: EmbedOptions): Promise<EmbedResponse> {
    if (this.embedding) {
      const inputs = Array.isArray(options.input) ? options.input : [options.input];
      const embeddings =
        inputs.length === 1
          ? [await this.embedding.embedText(inputs[0]!, { model: options.model })]
          : await this.embedding.embedDocuments(inputs, { model: options.model });
      return {
        embeddings,
        model: options.model ?? this.embedding.name,
        dimensions: embeddings[0]?.length ?? 0,
      };
    }
    try {
      return await this.provider.embed(options);
    } catch (error) {
      throw new KortexError('Embed request failed', 'EMBED_ERROR', error);
    }
  }

  async remember(entry: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<MemoryEntry> {
    if (!this.memory)
      throw new KortexError('No memory provider configured', 'MEMORY_NOT_CONFIGURED');
    return this.memory.saveMemory(entry);
  }

  async searchMemory(options: MemorySearchOptions): Promise<MemoryEntry[]> {
    if (!this.memory)
      throw new KortexError('No memory provider configured', 'MEMORY_NOT_CONFIGURED');
    return this.memory.searchMemory(options);
  }

  async retrieveContext(options: RetrieveContextOptions): Promise<RetrievedContext> {
    if (!this.vector)
      throw new KortexError('No vector provider configured', 'VECTOR_NOT_CONFIGURED');
    const { embeddings } = await this.embed({ input: options.query });
    const embedding = embeddings[0];
    if (!embedding) throw new KortexError('Failed to generate query embedding', 'EMBED_ERROR');
    const chunks = await this.vector.search({
      embedding,
      limit: options.limit ?? 5,
      userId: options.userId,
      sessionId: options.sessionId,
    });
    return { chunks, query: options.query };
  }

  async ingest(request: IngestRequest): Promise<RAGChunk[]> {
    if (!this.vector)
      throw new KortexError('No vector provider configured', 'VECTOR_NOT_CONFIGURED');
    const chunks: RAGChunk[] = [];
    for (const doc of request.documents) {
      for (const text of chunkText(doc.content, request.chunkSize, request.chunkOverlap)) {
        chunks.push({
          id: crypto.randomUUID(),
          content: text,
          metadata: { ...doc.metadata, sourceId: doc.id },
        });
      }
    }
    const { embeddings } = await this.embed({ input: chunks.map((c) => c.content) });
    const stored = await this.vector.upsert(
      chunks.map((chunk, i) => ({
        content: chunk.content,
        embedding: embeddings[i] ?? [],
        metadata: chunk.metadata,
        userId: request.userId,
        sessionId: request.sessionId,
      })),
    );
    return stored.map((row, i) => ({ ...chunks[i]!, id: row.id, embedding: row.embedding }));
  }

  async runTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    for (const provider of this.tools) {
      const tools = await provider.listTools();
      if (tools.some((t) => t.name === name)) {
        return provider.executeTool(name, args);
      }
    }
    throw new KortexError(`Tool not found: ${name}`, 'TOOL_NOT_FOUND');
  }

  async runAgent(agentId: string, input: string, context?: AgentContext): Promise<ChatResponse> {
    if (!this.agents) throw new KortexError('No agent provider configured', 'AGENT_NOT_CONFIGURED');
    return this.agents.runAgent(agentId, input, context);
  }

  async getHistory(userId: string, sessionId: string): Promise<Message[]> {
    if (!this.memory) return [];
    return this.memory.getMessages(userId, sessionId);
  }

  private async persistTurn(
    userId: string,
    sessionId: string,
    userMessage: string,
    assistantContent: string,
  ): Promise<void> {
    await this.memory!.saveMessage({ role: 'user', content: userMessage, userId, sessionId });
    await this.memory!.saveMessage({
      role: 'assistant',
      content: assistantContent,
      userId,
      sessionId,
    });
  }

  private async buildConversation(request: RuntimeChatRequest): Promise<{
    messages: Message[];
    retrievedContext?: RetrievedContext;
  }> {
    const messages: Message[] = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }

    let retrievedContext: RetrievedContext | undefined;
    if (request.useRag && this.vector) {
      try {
        retrievedContext = await this.retrieveContext({
          query: request.message,
          userId: request.userId,
          sessionId: request.sessionId,
        });
        if (retrievedContext.chunks.length > 0) {
          messages.push({
            role: 'system',
            content: `Retrieved context:\n${retrievedContext.chunks.map((c) => c.content).join('\n---\n')}`,
          });
        }
      } catch (error) {
        this.logger.warn('RAG retrieval skipped', { error: String(error) });
      }
    }

    if (request.useMemory !== false && this.memory) {
      messages.push(...(await this.memory.getMessages(request.userId, request.sessionId)));
    }

    messages.push({ role: 'user', content: request.message });
    return { messages, retrievedContext };
  }
}
