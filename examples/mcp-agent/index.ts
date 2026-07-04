import { createKortexFromEnv } from '@kortex/config';
import { MCPClient } from '@kortex/mcp';

async function main() {
  const mcp = new MCPClient({
    name: 'demo',
    url: process.env.MCP_SERVER_URL ?? 'http://localhost:8080',
  });
  const kortex = await createKortexFromEnv({ tools: [mcp] });

  const tools = await mcp.listTools();
  console.log(
    'Tools:',
    tools.map((t) => t.name),
  );

  if (tools[0]) {
    const result = await kortex.runTool(tools[0].name, {});
    console.log('Tool result:', result);
  }
}

main().catch(console.error);
