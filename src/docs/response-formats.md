# Response Formats Documentation

## Overview

This document outlines the different response formats used across the Trello MCP Server endpoints.

## Response Format Types

### 1. OAuth Discovery Endpoints (Standard JSON)

**Endpoints:**

- `/.well-known/oauth-protected-resource`
- `/.well-known/oauth-authorization-server`

**Format:** Standard JSON objects following OAuth 2.0 specifications

**Example:**

```json
{
  "issuer": "project-id",
  "authorization_endpoint": "https://example.com/oauth/authorize",
  "token_endpoint": "https://api.stytch.com/v1/public/project-id/oauth2/token",
  "scopes_supported": ["openid", "profile", "email", "offline_access"]
}
```

**Source:** [`src/remote/routes.ts:68-88`](../remote/routes.ts)

### 2. MCP Protocol Endpoints (JSON-RPC 2.0)

**Endpoints:**

- `/mcp` (POST, GET, DELETE)
- `/mcp/test`

**Format:** JSON-RPC 2.0 specification

**Success Response:**

```json
{
  "jsonrpc": "2.0",
  "id": "request-id",
  "result": { ... }
}
```

**Error Response:**

```json
{
  "jsonrpc": "2.0",
  "id": "request-id",
  "error": {
    "code": -32000,
    "message": "Error description"
  }
}
```

**Sources:**

- [`src/remote/mcp-config.ts:68-75`](../remote/mcp-config.ts)
- [`src/remote/middleware.ts:22,42`](../remote/middleware.ts)
- [`src/remote/mcp-config.ts:95-108`](../remote/mcp-config.ts) (createErrorResponse function)

### 3. Authentication Endpoints (Plain Text/JSON)

**Endpoints:**

- `/authenticate`

**Format:** Plain text or simple JSON responses

**Example:**

```
Hello, user@example.com!
```

**Source:** [`src/remote/mcp-config.ts:127-153`](../remote/mcp-config.ts)

## Key Differences

- **OAuth endpoints** use standard JSON for server metadata discovery
- **MCP endpoints** use JSON-RPC 2.0 for protocol communication
- **Auth endpoints** use simple text/JSON responses

## References

- [OAuth 2.0 Authorization Server Metadata (RFC 8414)](https://tools.ietf.org/html/rfc8414)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
