import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { allTools } from "./tools/index.js";
import { logger } from "./utils/logger.js";

// Create an MCP server
const server = new McpServer({
  name: "trello-mcp-server",
  version: "1.0.0",
});

// Register all tools
allTools.forEach((tool) => {
  server.registerTool(tool.name, tool.definition, tool.handler);
});

// Start the MCP server for CLI
export function startCLIServer() {
  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  server.connect(transport);
  logger.info("🚀 MCP server started!");
}

// Start the MCP server for remote usage
export async function startRemoteServer(
  transport: StreamableHTTPServerTransport
) {
  await server.connect(transport);
  logger.info("🚀 MCP server started!");
  return server;
}
