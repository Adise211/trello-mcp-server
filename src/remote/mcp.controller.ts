import { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import {
  isInitializeRequest,
  JSONRPCError,
} from "@modelcontextprotocol/sdk/types.js";
import { startRemoteServer } from "../server";
import { logger } from "../utils/logger";

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST request
export async function handlePostRequest(
  req: Request,
  res: Response
): Promise<void> {
  // Check for existing session ID
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    logger.info("[handlePostRequest] - sessionId found");
    // Reuse existing transport
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    logger.info(
      "[handlePostRequest] - no sessionId - new initialization request"
    );
    // New initialization request
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        // Store the transport by session ID
        transports[sessionId] = transport;
      },
      // DNS rebinding protection is disabled by default for backwards compatibility. If you are running this server
      // locally, make sure to set:
      // enableDnsRebindingProtection:
      //   process.env.NODE_ENV === "production" ? false : true,
      // allowedHosts: process.env.NODE_ENV === "production" ? [] : ["127.0.0.1"],
    });

    // Clean up transport when closed
    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };

    // Start the MCP server for remote usage
    await startRemoteServer(transport);
  } else {
    logger.error("[handlePostRequest] - invalid request");
    // Invalid request
    return;
  }

  if (transport) {
    logger.info("[handlePostRequest] - starting request handling");
    // Handle the request
    await transport.handleRequest(req, res, req.body);
  } else {
    res
      .status(400)
      .json(
        createErrorResponse("Bad Request: No valid session ID provided", -32000)
      );
  }
}

// // Reusable handler for GET and DELETE requests
export const handleSessionRequest = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    logger.info("[handleSessionRequest] - sessionId found");
    if (!sessionId || !transports[sessionId]) {
      logger.error("[handleSessionRequest] - Invalid or missing session ID");
      res.status(400).send("Invalid or missing session ID");
      return;
    }

    const transport = transports[sessionId];
    logger.info("[handleSessionRequest] - transport found");
    await transport.handleRequest(req, res);
  } catch (error) {
    logger.error("[handleSessionRequest] - error: ", error);
    res.status(500).json("Internal Server Error");
  }
};

// Error response
export function createErrorResponse(
  message: string,
  code: number
): JSONRPCError {
  return {
    jsonrpc: "2.0",
    id: randomUUID(),
    error: {
      code: code,
      message: message,
    },
  };
}
