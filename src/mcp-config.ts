import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Tool } from "@modelcontextprotocol/sdk/types";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse";

export class MCPServer {
  private server: McpServer;
  private tools: any[];
  private transport:
    | StreamableHTTPServerTransport
    | StdioServerTransport
    | SSEServerTransport;

  constructor(
    tools: Tool[],
    transport:
      | StreamableHTTPServerTransport
      | StdioServerTransport
      | SSEServerTransport
  ) {
    // Initialize the server
    this.server = new McpServer({
      name: "trello-mcp-server",
      version: "1.0.0",
    });

    // Initialize the transport
    this.transport = transport;

    // Connect the tools
    this.tools = tools;
    this.tools.forEach((tool: any) => {
      this.server.registerTool(tool.name, tool.definition, tool.handler);
    });
  }

  /**
   * Start the server
   */
  startServer() {
    this.server.connect(this.transport);
  }

  /**
   * Stop the server
   */
  stopServer() {
    this.server.close();
  }

  /**
   * Get the server instance
   */
  get serveInstance() {
    return this.server;
  }

  /**
   * Get the server transport
   */
  get serverTransport() {
    return this.transport;
  }

  /**
   * Get the server tools
   */
  get serverTools() {
    return this.tools;
  }
}
