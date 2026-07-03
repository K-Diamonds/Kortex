import { Code, DocPage, DocsNav } from '@/components/Docs';

export default function McpAgentsPage() {
  return (
    <>
      <DocsNav />
      <DocPage title="MCP Tools & Agents">
        <h2>MCP tools</h2>
        <p>Enable builtin tools with <code>MCP_ENABLED=true</code> or register MCP servers:</p>
        <Code>{`import { MCPClient } from "@kortex/mcp";

const mcp = new MCPClient({ name: "my-server", url: "http://localhost:8080" });
const kortex = await createKortexFromEnv({ tools: [mcp] });

const result = await kortex.runTool("tool_name", { arg: "value" });`}</Code>

        <h2>Agents</h2>
        <Code>{`import { KortexAgentProvider } from "@kortex/agents";

const kortex = await createKortexFromEnv();
const agents = new KortexAgentProvider(kortex);

const agent = await agents.createAgent({
  name: "researcher",
  instructions: "You research topics thoroughly.",
  useMemory: true,
  useRag: true,
});

const response = await kortex.runAgent(agent.id, "Explain pgvector");`}</Code>

        <h2>Demo tool command</h2>
        <p>In the chatbot demo, send:</p>
        <Code>/tool get_current_time {}</Code>
      </DocPage>
    </>
  );
}
