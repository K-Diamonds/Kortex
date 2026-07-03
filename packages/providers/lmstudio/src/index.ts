import { HttpOpenAICompatibleProvider } from '@kortex/provider-shared';

export interface LMStudioProviderConfig {
  baseUrl?: string;
  model?: string;
}

export class LMStudioProvider extends HttpOpenAICompatibleProvider {
  constructor(config: LMStudioProviderConfig = {}) {
    super({
      name: 'lmstudio',
      baseUrl: config.baseUrl ?? 'http://localhost:1234',
      model: config.model ?? 'local-model',
      paths: { chat: '/v1/chat/completions', embed: '/v1/embeddings', models: '/v1/models' },
    });
  }
}
