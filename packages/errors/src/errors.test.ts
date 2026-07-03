import { describe, it, expect } from 'vitest';
import { KortexError, ConfigError } from '../src/index.js';

describe('@kortex/errors', () => {
  it('KortexError carries code and cause', () => {
    const err = new KortexError('failed', 'TEST', new Error('root'));
    expect(err.name).toBe('KortexError');
    expect(err.code).toBe('TEST');
    expect(err.cause).toBeInstanceOf(Error);
  });

  it('ConfigError carries field', () => {
    const err = new ConfigError('missing key', 'OPENAI_API_KEY');
    expect(err.field).toBe('OPENAI_API_KEY');
  });
});
