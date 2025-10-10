import { Router, Request, Response, response } from "express";
import { authorizeTokenMiddleware } from "./middleware";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { handlePostRequest, handleSessionRequest } from "./mcp.controller";
import { logger } from "../utils/logger";

const router = Router();

// Home page
router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Trello MCP Server");
});

// Health check
// router.get("/health", (req: Request, res: Response) => {
//   res.status(200).send("OK");
// });

// MCP endpoint - POST request
router.post(
  "/mcp/me",
  authorizeTokenMiddleware,
  async (req: Request, res: Response) => {
    logger.info(
      "[mcp route] - starting mcp route - getting authorization: " +
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
      logger.error("[mcp route] - error handling MCP request: ", error);
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
router.post("/mcp", authorizeTokenMiddleware, handlePostRequest);
router.get("/mcp", authorizeTokenMiddleware, handleSessionRequest);
router.delete("/mcp", authorizeTokenMiddleware, handleSessionRequest);

export default router;
