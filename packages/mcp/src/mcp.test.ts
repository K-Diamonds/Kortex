import { describe, it, expect } from 'vitest';
import { createMCPRegistry } from './index.js';

describe('MCPRegistry', () => {
  it('registers servers and returns providers', () => {
    const registry = createMCPRegistry();
    const client = registry.register({ name: 'test', url: 'http://localhost:3100' });
    expect(client.name).toBe('mcp:test');
    expect(registry.getProviders()).toHaveLength(1);
  });
});
