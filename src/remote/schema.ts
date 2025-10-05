import { z } from "zod";

// JSON-RPC protocol error schema
export const JsonRPCErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
});

// JSON-RPC protocol response schema
export const JsonRPCResponseSchema = z.object({
  id: z.string(),
  result: z.any(),
  error: JsonRPCErrorSchema.optional().nullable(),
});

// JSON-RPC protocol request schema
export const JsonRPCRequestSchema = z.object({
  id: z.string(),
  method: z.string(),
  params: z.any(),
});

// JSON-RPC protocol types
export type JsonRPCRequest = z.infer<typeof JsonRPCRequestSchema>;
export type JsonRPCResponse = z.infer<typeof JsonRPCResponseSchema>;
export type JsonRPCError = z.infer<typeof JsonRPCErrorSchema>;
