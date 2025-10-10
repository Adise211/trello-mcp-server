import { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import {
  isInitializeRequest,
  JSONRPCError,
} from "@modelcontextprotocol/sdk/types.js";
import { startRemoteServer } from "../server";

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST request
export async function handlePostRequest(
  req: Request,
  res: Response
): Promise<void> {
  console.log("In handlePostRequest.. ");
  // Check for existing session ID
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    console.log("In handlePostRequest - sessionId found");
    // Reuse existing transport
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    console.log(
      "In handlePostRequest - no sessionId - new initialization request"
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
    console.log("In handlePostRequest - transport: ", !!transport);

    // Clean up transport when closed
    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };

    // Start the MCP server for remote usage
    await startRemoteServer(transport);
  } else {
    console.log("In handlePostRequest - invalid request");
    // Invalid request
    return;
  }
  if (transport) {
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
    console.log("In handleSessionRequest.. ");
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    console.log("In handleSessionRequest - sessionId found");
    if (!sessionId || !transports[sessionId]) {
      console.log("In handleSessionRequest - Invalid or missing session ID");
      res.status(400).send("Invalid or missing session ID");
      return;
    }

    const transport = transports[sessionId];
    console.log("In handleSessionRequest - transport found");
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("In handleSessionRequest - error: ", error);
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
