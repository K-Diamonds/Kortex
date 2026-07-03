import type { ToolDefinition, ToolHandler, ToolProvider } from '@kortex/core';
import { evaluateMathExpression } from './math-parser.js';

export interface BuiltinTool {
  definition: ToolDefinition;
  handler: ToolHandler;
}

export class BuiltinToolProvider implements ToolProvider {
  readonly name = 'builtin';
  private readonly registry = new Map<string, { definition: ToolDefinition; handler: ToolHandler }>();

  constructor(tools: BuiltinTool[] = defaultTools) {
    for (const tool of tools) {
      this.registerTool(tool.definition, tool.handler);
    }
  }

  registerTool(tool: ToolDefinition, handler: ToolHandler): void {
    this.registry.set(tool.name, { definition: tool, handler });
  }

  async listTools(): Promise<ToolDefinition[]> {
    return [...this.registry.values()].map((entry) => entry.definition);
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.registry.get(name);
    if (!tool) {
      throw new Error(`Builtin tool not found: ${name}`);
    }
    return tool.handler(args);
  }
}

export const defaultTools: BuiltinTool[] = [
  {
    definition: {
      name: 'get_current_time',
      description: 'Returns the current date and time in ISO format',
      parameters: { type: 'object', properties: {} },
    },
    handler: async () => new Date().toISOString(),
  },
  {
    definition: {
      name: 'calculate',
      description: 'Evaluate a simple math expression',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'Math expression e.g. 2 + 2' },
        },
        required: ['expression'],
      },
    },
    handler: async (args) => {
      const expr = String(args.expression ?? '');
      return evaluateMathExpression(expr);
    },
  },
];

export function createBuiltinToolProvider(tools: BuiltinTool[] = defaultTools): BuiltinToolProvider {
  return new BuiltinToolProvider(tools);
}
