export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
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
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
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
