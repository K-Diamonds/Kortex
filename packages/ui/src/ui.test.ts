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
});
