import { describe, it, expect } from 'vitest';
import type { KortexProps } from './types.js';

describe('@kortex/react-native types', () => {
  it('uses apiEndpoint-only public contract', () => {
    const props: KortexProps = {
      apiEndpoint: 'https://example.com/api/kortex/chat',
      memory: true,
    };
    expect(props.apiEndpoint).toContain('/api/kortex/chat');
  });
});
