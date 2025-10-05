// import { Request, Response } from "express";
// import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
// import { randomUUID } from "node:crypto";
// import {
//   isInitializeRequest,
//   JSONRPCError,
// } from "@modelcontextprotocol/sdk/types.js";
// import { startRemoteServer } from "../server";
// import { logger } from "../utils/logger";
import stytch from "stytch";

export const stytchClient = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID as string,
  secret: process.env.STYTCH_SECRET as string,
  custom_base_url: process.env.STYTCH_DOMAIN as string,
});

// Map to store transports by session ID
// const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// export async function handlePostRequest(
//   req: Request,
//   res: Response
// ): Promise<void> {
//   console.log("In handlePostRequest - req: ", req);
//   // Check for existing session ID
//   const sessionId = req.headers["mcp-session-id"] as string | undefined;
//   console.log("In handlePostRequest - sessionId: ", sessionId);
//   let transport: StreamableHTTPServerTransport;

//   if (sessionId && transports[sessionId]) {
//     // Reuse existing transport
//     transport = transports[sessionId];
//   } else if (!sessionId && isInitializeRequest(req.body)) {
//     // New initialization request
//     transport = new StreamableHTTPServerTransport({
//       sessionIdGenerator: () => randomUUID(),
//       onsessioninitialized: (sessionId) => {
//         // Store the transport by session ID
//         transports[sessionId] = transport;
//       },
//       // DNS rebinding protection is disabled by default for backwards compatibility. If you are running this server
//       // locally, make sure to set:
//       // enableDnsRebindingProtection:
//       //   process.env.NODE_ENV === "production" ? false : true,
//       // allowedHosts: process.env.NODE_ENV === "production" ? [] : ["127.0.0.1"],
//     });
//     console.log("In handlePostRequest - transport: ", !!transport);

//     // Clean up transport when closed
//     transport.onclose = () => {
//       if (transport.sessionId) {
//         delete transports[transport.sessionId];
//       }
//     };

//     // Start the MCP server for remote usage
//     await startRemoteServer(transport);
//   } else {
//     // Invalid request

//     return;
//   }

//   if (transport) {
//     // Handle the request
//     await transport.handleRequest(req, res, req.body);
//   } else {
//     res.status(400).json({
//       jsonrpc: "2.0",
//       error: {
//         code: -32000,
//         message: "Bad Request: No valid session ID provided",
//       },
//       id: null,
//     });
//   }
// }

// // Reusable handler for GET and DELETE requests
// export const handleSessionRequest = async (req: Request, res: Response) => {
//   console.log("In handleSessionRequest - req: ", req);
//   const sessionId = req.headers["mcp-session-id"] as string | undefined;
//   console.log("In handleSessionRequest - sessionId: ", sessionId);
//   if (!sessionId || !transports[sessionId]) {
//     console.log("In handleSessionRequest - Invalid or missing session ID");
//     res.status(400).send("Invalid or missing session ID");
//     return;
//   }

//   const transport = transports[sessionId];
//   console.log("In handleSessionRequest - transport: ", transport);
//   await transport.handleRequest(req, res);
// };

// export function createErrorResponse(
//   message: string,
//   code: number
// ): JSONRPCError {
//   console.log("In createErrorResponse - message: ", message, "code: ", code);
//   return {
//     jsonrpc: "2.0",
//     id: randomUUID(),
//     error: {
//       code: code,
//       message: message,
//     },
//   };
// }

// export const testMcp = async (req: Request, res: Response) => {
//   logger.info("In testMcp - req: ", req);

//   const transport = new StreamableHTTPServerTransport({
//     sessionIdGenerator: undefined,
//   });

//   res.on("close", () => {
//     logger.info("In testMcp - Request closed");
//     transport.close();
//   });

//   await startRemoteServer(transport);

//   await transport.handleRequest(req, res, req.body);
// };

// export const authenticate = async (req: Request, res: Response) => {
//   const token = req.query.token as string;
//   const tokenType = req.query.stytch_token_type;
//   console.log("In authenticate - token: ", token, "tokenType: ", tokenType);
//   // Distinct token_type for each auth flow
//   // so you know which authenticate() method to use
//   if (tokenType !== "oauth") {
//     console.error(`Unsupported token type: '${tokenType}'`);
//     res.status(400).send();
//     return;
//   }

//   stytchClient.oauth
//     .authenticate({
//       token: token,
//       session_duration_minutes: 60,
//     })
//     .then((response) => {
//       // Using express sessions to store the returned session cookie
//       // @ts-ignore
//       req.session.StytchSessionToken = response.session_token;
//       res.send(`Hello, ${response?.user?.emails[0]?.email}!`);
//     })
//     .catch((err) => {
//       res.status(401).send(err.toString());
//     });
// };
