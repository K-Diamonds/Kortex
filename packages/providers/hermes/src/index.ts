import { HttpOpenAICompatibleProvider } from '@kortex/provider-shared';

export interface HermesProviderConfig {
  baseUrl?: string;
  model?: string;
  token?: string;
}

export class HermesProvider extends HttpOpenAICompatibleProvider {
  constructor(config: HermesProviderConfig = {}) {
    super({
      name: 'hermes',
      baseUrl: config.baseUrl ?? 'http://localhost:3000',
      model: config.model ?? 'hermes',
      token: config.token,
      paths: { chat: '/v1/chat/completions', embed: '/v1/embeddings', models: '/v1/models' },
    });
  }
}
