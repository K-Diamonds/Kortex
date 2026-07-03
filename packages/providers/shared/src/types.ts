export type Role = 'system' | 'user' | 'assistant' | 'tool';

export interface Message {
  role: Role;
  content: string;
}

export interface ChatOptions {
  messages: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  finishReason?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  model?: string;
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

export interface AIProvider {
  readonly name: string;
  chat(options: ChatOptions): Promise<ChatResponse>;
  stream(options: ChatOptions): AsyncIterable<StreamChunk>;
  embed(options: EmbedOptions): Promise<EmbedResponse>;
  validateConfig(): Promise<void>;
}
