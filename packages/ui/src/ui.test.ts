import { describe, it, expect } from 'vitest';
import type { KortexProps } from './types.js';

describe('@kortex/ui types', () => {
  it('requires apiEndpoint only for public UI contract', () => {
    const props: KortexProps = {
      apiEndpoint: '/api/kortex/chat',
      memory: true,
      rag: true,
    };
    expect(props.apiEndpoint).toBe('/api/kortex/chat');
  });

  it('does not include secret fields in KortexProps', () => {
    const forbidden = ['apiKey', 'openaiApiKey', 'databaseUrl', 'connectionString', 'token'] as const;
    type Keys = keyof KortexProps;
    const keys: Keys[] = forbidden as unknown as Keys[];
    for (const key of keys) {
      expect(['apiEndpoint', 'title'].includes(key as string)).toBe(false);
    }
  });

  it('allows className and style for chat panel customization', () => {
    const props: KortexProps = {
      apiEndpoint: '/api/kortex/chat',
      className: 'my-kortex-chat',
      style: { width: 420, fontFamily: 'Georgia, serif', background: '#111' },
    };
    expect(props.className).toBe('my-kortex-chat');
    expect(props.style?.width).toBe(420);
  });

  it('exports deprecated aliases for renamed response types', () => {
    type ResponseAlias = import('./types.js').KortexChatResponse;
    type RequestAlias = import('./types.js').KortexChatRequestBody;
    const response: ResponseAlias = { content: 'ok' };
    const request: RequestAlias = { message: 'hi', userId: 'u', sessionId: 's' };
    expect(response.content).toBe('ok');
    expect(request.message).toBe('hi');
  });
});
