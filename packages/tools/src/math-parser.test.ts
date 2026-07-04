import { describe, it, expect } from 'vitest';
import { evaluateMathExpression } from './math-parser.js';

describe('evaluateMathExpression', () => {
  it.each([
    ['2 + 2', 4],
    ['10 - 3', 7],
    ['3 * 4', 12],
    ['8 / 2', 4],
    ['2 + 3 * 4', 14],
    ['(2 + 3) * 4', 20],
    ['((1 + 2) * (3 + 4)) / 7', 3],
    ['-5 + 3', -2],
    ['(-5)', -5],
    ['3.5 + 1.5', 5],
    ['0', 0],
    ['  12  +  8  ', 20],
  ])('evaluates %s as %s', (expression, expected) => {
    expect(evaluateMathExpression(expression)).toBe(expected);
  });

  it.each(['', '   ', '2 +', '2 + 2)', '(2 + 3', '2 & 2', 'abc', '2 + 2;', '2 ** 2', '1..2', '()'])(
    'rejects invalid expression: %s',
    (expression) => {
      expect(() => evaluateMathExpression(expression)).toThrow('Invalid expression');
    },
  );

  it('rejects division by zero', () => {
    expect(() => evaluateMathExpression('1 / 0')).toThrow('Division by zero');
  });
});
