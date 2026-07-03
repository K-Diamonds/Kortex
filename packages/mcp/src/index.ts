import type { ToolDefinition, ToolHandler, ToolProvider } from '@kortex/core';
import { KortexError } from '@kortex/errors';
import { createLogger } from '@kortex/logger';

export interface MCPServerConfig {
  name: string;
  url: string;
  headers?: Record<string, string>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

const logger = createLogger({ name: 'kortex-mcp' });

export class MCPClient implements ToolProvider {
  readonly name: string;
  private tools: ToolDefinition[] = [];
  private readonly overrides = new Map<string, ToolHandler>();

  constructor(private readonly config: MCPServerConfig) {
    this.name = `mcp:${config.name}`;
  }

  registerTool(tool: ToolDefinition, handler: ToolHandler): void {
    this.overrides.set(tool.name, handler);
    if (!this.tools.find((t) => t.name === tool.name)) {
      this.tools.push(tool);
    }
  }

  async connect(): Promise<void> {
    logger.info('connecting to MCP server', { name: this.config.name, url: this.config.url });

    const response = await fetch(`${this.config.url}/tools/list`, {
      headers: this.config.headers,
    });

    if (!response.ok) {
      throw new Error(`MCP server ${this.config.name} connection failed: ${response.statusText}`);
    }

    const data = (await response.json()) as { tools: MCPTool[] };
    this.tools = data.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }));
  }

  async listTools(): Promise<ToolDefinition[]> {
    if (this.tools.length === 0) {
      await this.connect();
    }
    return this.tools;
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const override = this.overrides.get(name);
    if (override) {
      return override(args);
    }

    logger.debug('executing MCP tool', { server: this.config.name, tool: name });

    const response = await fetch(`${this.config.url}/tools/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.config.headers },
      body: JSON.stringify({ name, arguments: args }),
    });

    if (!response.ok) {
      throw new Error(`MCP tool ${name} failed: ${response.statusText}`);
    }

    const data = (await response.json()) as { result: unknown };
    return data.result;
  }
}

export class MCPRegistry {
  private servers: MCPClient[] = [];

  register(config: MCPServerConfig): MCPClient {
    const client = new MCPClient(config);
    this.servers.push(client);
    return client;
  }

  getProviders(): ToolProvider[] {
    return this.servers;
  }

  async connectAll(): Promise<void> {
    await Promise.all(this.servers.map((s) => s.connect()));
  }
}

export function createMCPRegistry(): MCPRegistry {
  return new MCPRegistry();
}

export function assertMcpReadOnly(tool: ToolDefinition): never {
  throw new KortexError(`MCP tool ${tool.name} is server-managed`, 'MCP_READONLY');
}
