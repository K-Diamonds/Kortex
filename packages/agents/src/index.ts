import { randomUUID } from 'node:crypto';
import type {
  Agent,
  AgentConfig,
  AgentContext,
  AgentProvider,
  ChatResponse,
  KortexRuntime,
  Message,
  StreamChunk,
  ToolDefinition,
} from '@kortex/core';
import { createLogger } from '@kortex/logger';

export interface KortexAgentConfig {
  name: string;
  instructions: string;
  tools?: ToolDefinition[];
  useMemory?: boolean;
  useRAG?: boolean;
}

const logger = createLogger({ name: 'kortex-agents' });

export class KortexAgent implements Agent {
  readonly id: string;
  readonly name: string;
  readonly instructions: string;
  private readonly tools: ToolDefinition[];
  private readonly useMemory: boolean;
  private readonly useRAG: boolean;

  constructor(
    private readonly runtime: KortexRuntime,
    config: KortexAgentConfig,
    id?: string,
  ) {
    this.id = id ?? randomUUID();
    this.name = config.name;
    this.instructions = config.instructions;
    this.tools = config.tools ?? [];
    this.useMemory = config.useMemory ?? true;
    this.useRAG = config.useRAG ?? false;
  }

  async run(input: string, context: AgentContext = {}): Promise<ChatResponse> {
    const messages = await this.buildMessages(input, context);
    return this.runtime.complete({
      messages,
      tools: this.tools.length ? this.tools : context.tools,
      userId: context.userId,
      sessionId: context.sessionId,
    });
  }

  async *stream(input: string, context: AgentContext = {}): AsyncIterable<StreamChunk> {
    const messages = await this.buildMessages(input, context);
    yield* this.runtime.streamComplete({
      messages,
      tools: this.tools.length ? this.tools : context.tools,
      userId: context.userId,
      sessionId: context.sessionId,
    });
  }

  private async buildMessages(input: string, context: AgentContext): Promise<Message[]> {
    const messages: Message[] = [{ role: 'system', content: this.instructions }];

    if (this.useMemory && context.userId) {
      const memories = await this.runtime.searchMemory({
        userId: context.userId,
        sessionId: context.sessionId,
        query: input,
        limit: 5,
      });

      if (memories.length > 0) {
        const memoryContext = memories.map((m) => m.content).join('\n');
        messages.push({
          role: 'system',
          content: `Relevant memories:\n${memoryContext}`,
        });
      }
    }

    if (this.useRAG) {
      try {
        const ragContext = await this.runtime.retrieveContext({
          query: input,
          userId: context.userId,
          sessionId: context.sessionId,
        });

        if (ragContext.chunks.length > 0) {
          const contextText = ragContext.chunks.map((c) => c.content).join('\n---\n');
          messages.push({
            role: 'system',
            content: `Retrieved context:\n${contextText}`,
          });
        }
      } catch (error) {
        logger.warn('RAG retrieval skipped', { error: String(error) });
      }
    }

    if (context.userId && context.sessionId) {
      const history = await this.runtime.getHistory(context.userId, context.sessionId);
      messages.push(...history);
    }

    messages.push({ role: 'user', content: input });
    return messages;
  }
}

export class KortexAgentProvider implements AgentProvider {
  readonly name = 'kortex-agents';
  private readonly agents = new Map<string, KortexAgent>();

  constructor(private readonly runtime: KortexRuntime) {}

  async createAgent(config: AgentConfig): Promise<Agent> {
    const agent = new KortexAgent(this.runtime, config, config.id);
    this.agents.set(agent.id, agent);
    logger.info('agent created', { id: agent.id, name: agent.name });
    return agent;
  }

  async runAgent(agentId: string, input: string, context?: AgentContext): Promise<ChatResponse> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    return agent.run(input, context);
  }
}

export function createAgent(runtime: KortexRuntime, config: KortexAgentConfig): KortexAgent {
  return new KortexAgent(runtime, config);
}

export function createAgentProvider(runtime: KortexRuntime): KortexAgentProvider {
  return new KortexAgentProvider(runtime);
}
