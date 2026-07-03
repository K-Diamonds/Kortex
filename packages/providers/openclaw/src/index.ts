import { HttpOpenAICompatibleProvider } from '@kortex/provider-shared';

export interface OpenClawProviderConfig {
  baseUrl?: string;
  model?: string;
  token?: string;
}

export class OpenClawProvider extends HttpOpenAICompatibleProvider {
  constructor(config: OpenClawProviderConfig = {}) {
    super({
      name: 'openclaw',
      baseUrl: config.baseUrl ?? 'http://localhost:18789',
      model: config.model ?? 'default',
      token: config.token,
      paths: { chat: '/v1/chat/completions', embed: '/v1/embeddings', models: '/v1/models' },
    });
  }
}
