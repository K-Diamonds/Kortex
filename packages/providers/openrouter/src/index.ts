import { HttpOpenAICompatibleProvider } from '@kortex/provider-shared';

export interface OpenRouterProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export class OpenRouterProvider extends HttpOpenAICompatibleProvider {
  constructor(config: OpenRouterProviderConfig) {
    if (!config.apiKey?.trim()) throw new Error('OPENROUTER_API_KEY is required');
    super({
      name: 'openrouter',
      baseUrl: config.baseUrl ?? 'https://openrouter.ai/api/v1',
      model: config.model ?? 'openai/gpt-4o-mini',
      apiKey: config.apiKey,
    });
  }
}
