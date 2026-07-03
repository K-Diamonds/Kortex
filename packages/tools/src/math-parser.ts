type Op = '+' | '-' | '*' | '/';

type Token =
  | { type: 'number'; value: number }
  | { type: 'op'; value: Op }
  | { type: 'lparen' }
  | { type: 'rparen' };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i]!;

    if (char === ' ' || char === '\t') {
      i++;
      continue;
    }

    if (char === '+' || char === '-' || char === '*' || char === '/') {
      tokens.push({ type: 'op', value: char });
      i++;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }

    if (char >= '0' && char <= '9' || char === '.') {
      const start = i;
      while (i < input.length && /[\d.]/.test(input[i]!)) {
        i++;
      }
      const raw = input.slice(start, i);
      if (!/^\d+(\.\d+)?$/.test(raw)) {
        throw new Error('Invalid expression');
      }
      tokens.push({ type: 'number', value: Number(raw) });
      continue;
    }

    throw new Error('Invalid expression');
  }

  return tokens;
}

class Parser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): number {
    if (this.tokens.length === 0) {
      throw new Error('Invalid expression');
    }

    const value = this.parseExpression();

    if (this.pos < this.tokens.length) {
      throw new Error('Invalid expression');
    }

    return value;
  }

  private parseExpression(): number {
    let value = this.parseTerm();

    while (this.match('op', '+') || this.match('op', '-')) {
      const op = this.previous() as { type: 'op'; value: Op };
      const right = this.parseTerm();
      value = op.value === '+' ? value + right : value - right;
    }

    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor();

    while (this.match('op', '*') || this.match('op', '/')) {
      const op = this.previous() as { type: 'op'; value: Op };
      const right = this.parseFactor();
      if (op.value === '*') {
        value *= right;
      } else if (right === 0) {
        throw new Error('Division by zero');
      } else {
        value /= right;
      }
    }

    return value;
  }

  private parseFactor(): number {
    if (this.match('op', '-')) {
      return -this.parseFactor();
    }

    if (this.match('op', '+')) {
      return this.parseFactor();
    }

    if (this.match('number')) {
      return (this.previous() as { type: 'number'; value: number }).value;
    }

    if (this.match('lparen')) {
      const value = this.parseExpression();
      if (!this.match('rparen')) {
        throw new Error('Invalid expression');
      }
      return value;
    }

    throw new Error('Invalid expression');
  }

  private match(type: Token['type'], value?: Op): boolean {
    const token = this.tokens[this.pos];
    if (!token || token.type !== type) {
      return false;
    }
    if (value !== undefined && token.type === 'op' && token.value !== value) {
      return false;
    }
    this.pos++;
    return true;
  }

  private previous(): Token {
    return this.tokens[this.pos - 1]!;
  }
}

/** Evaluate a math expression with numbers, + - * /, and parentheses only. */
export function evaluateMathExpression(expression: string): number {
  const trimmed = expression.trim();
  if (!trimmed) {
    throw new Error('Invalid expression');
  }

  const tokens = tokenize(trimmed);
  return new Parser(tokens).parse();
}
