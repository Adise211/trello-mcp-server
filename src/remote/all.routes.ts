import { Router, Request, Response, response } from "express";
import { authorizeTokenMiddleware } from "./middleware";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const router = Router();

// Home page
router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Trello MCP Server");
});

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

// MCP endpoint - POST request
router.post(
  "/mcp",
  authorizeTokenMiddleware,
  async (req: Request, res: Response) => {
    console.log(
      "In mcp route, req.get('authorization')",
      req.get("authorization")
    );
    const server = new McpServer({ name: "Demo", version: "1.0.0" });

    // The server can now access the validated req.user within tool calls
    server.tool("whoami", {}, async () => ({
      content: [
        {
          type: "text",
          text: "You are " + JSON.stringify((req as any).user, null, 2),
        },
      ],
    }));

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
);

export default router;
