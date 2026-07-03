export type ProviderStatus = 'Stable' | 'Beta' | 'Experimental';

export interface ProviderInfo {
  name: string;
  aiProvider: string;
  package: string;
  chat: boolean;
  streaming: boolean;
  embeddings: boolean;
  status: ProviderStatus;
  envVars: string[];
  notes?: string;
}

export const providerStatusGuide: Record<
  ProviderStatus,
  { label: string; description: string }
> = {
  Stable: {
    label: 'Stable',
    description: 'Reference adapter with the most test coverage. Recommended for evaluation and early production pilots.',
  },
  Beta: {
    label: 'Beta',
    description: 'Implemented and usable, but APIs and behavior may change. Less test coverage than OpenAI.',
  },
  Experimental: {
    label: 'Experimental',
    description:
      'Generic HTTP-compatible adapters for OpenAI-style chat, streaming, and embeddings endpoints. Endpoint paths and auth vary by deployment — validate against your server before relying on them.',
  },
};

export const providers: ProviderInfo[] = [
  {
    name: 'OpenAI',
    aiProvider: 'openai',
    package: '@kortex/openai',
    chat: true,
    streaming: true,
    embeddings: true,
    status: 'Stable',
    envVars: ['AI_PROVIDER=openai', 'OPENAI_API_KEY', 'AI_MODEL (optional)'],
  },
  {
    name: 'Anthropic',
    aiProvider: 'anthropic',
    package: '@kortex/anthropic',
    chat: true,
    streaming: true,
    embeddings: false,
    status: 'Beta',
    envVars: ['AI_PROVIDER=anthropic', 'ANTHROPIC_API_KEY', 'AI_MODEL (optional)'],
    notes: 'No native embeddings — set EMBEDDING_PROVIDER=openai or another embedding backend for RAG.',
  },
  {
    name: 'Google Gemini',
    aiProvider: 'gemini',
    package: '@kortex/gemini',
    chat: true,
    streaming: true,
    embeddings: true,
    status: 'Beta',
    envVars: ['AI_PROVIDER=gemini', 'GEMINI_API_KEY', 'AI_MODEL (optional)'],
  },
  {
    name: 'OpenRouter',
    aiProvider: 'openrouter',
    package: '@kortex/openrouter',
    chat: true,
    streaming: true,
    embeddings: true,
    status: 'Beta',
    envVars: ['AI_PROVIDER=openrouter', 'OPENROUTER_API_KEY', 'AI_MODEL (optional)'],
  },
  {
    name: 'Ollama',
    aiProvider: 'ollama',
    package: '@kortex/ollama',
    chat: true,
    streaming: true,
    embeddings: true,
    status: 'Beta',
    envVars: ['AI_PROVIDER=ollama', 'OLLAMA_BASE_URL', 'AI_MODEL (optional)'],
    notes: 'Self-hosted. Uses Ollama HTTP APIs with OpenAI-compatible chat paths.',
  },
  {
    name: 'LM Studio',
    aiProvider: 'lmstudio',
    package: '@kortex/lmstudio',
    chat: true,
    streaming: true,
    embeddings: true,
    status: 'Beta',
    envVars: ['AI_PROVIDER=lmstudio', 'LMSTUDIO_BASE_URL', 'AI_MODEL (optional)'],
    notes: 'Self-hosted OpenAI-compatible local server.',
  },
  {
    name: 'OpenClaw',
    aiProvider: 'openclaw',
    package: '@kortex/openclaw',
    chat: true,
    streaming: true,
    embeddings: true,
    status: 'Experimental',
    envVars: [
      'AI_PROVIDER=openclaw',
      'OPENCLAW_BASE_URL',
      'OPENCLAW_TOKEN (optional)',
      'AI_MODEL (optional)',
    ],
    notes: 'Experimental HTTP-compatible adapter — assumes `/v1/chat/completions`, `/v1/embeddings`, and `/v1/models` on your server.',
  },
  {
    name: 'Hermes',
    aiProvider: 'hermes',
    package: '@kortex/hermes',
    chat: true,
    streaming: true,
    embeddings: true,
    status: 'Experimental',
    envVars: [
      'AI_PROVIDER=hermes',
      'HERMES_BASE_URL',
      'HERMES_TOKEN (optional)',
      'AI_MODEL (optional)',
    ],
    notes: 'Experimental HTTP-compatible adapter — assumes `/v1/chat/completions`, `/v1/embeddings`, and `/v1/models` on your server.',
  },
];

export function statusColor(status: ProviderStatus): string {
  switch (status) {
    case 'Stable':
      return '#34d399';
    case 'Beta':
      return '#fbbf24';
    case 'Experimental':
      return '#f87171';
  }
}
