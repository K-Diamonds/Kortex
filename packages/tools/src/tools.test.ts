import { describe, it, expect } from 'vitest';
import { createBuiltinToolProvider } from './index.js';

describe('BuiltinToolProvider', () => {
  const provider = createBuiltinToolProvider();

  it('lists default tools', async () => {
    const tools = await provider.listTools();
    expect(tools.map((t) => t.name)).toContain('get_current_time');
    expect(tools.map((t) => t.name)).toContain('calculate');
  });

  it('runs calculate tool', async () => {
    const result = await provider.executeTool('calculate', { expression: '2 + 2' });
    expect(result).toBe(4);
  });

  it('runs calculate tool with parentheses', async () => {
    const result = await provider.executeTool('calculate', { expression: '(2 + 3) * 4' });
    expect(result).toBe(20);
  });

  it('rejects invalid calculate expressions', async () => {
    await expect(provider.executeTool('calculate', { expression: 'eval(1)' })).rejects.toThrow(
      'Invalid expression',
    );
  });

  it('runs get_current_time tool', async () => {
    const result = await provider.executeTool('get_current_time', {});
    expect(typeof result).toBe('string');
    expect(() => new Date(String(result))).not.toThrow();
  });
});
