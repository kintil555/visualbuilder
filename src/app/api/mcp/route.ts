import { NextRequest } from "next/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { verifyApiToken } from "@/lib/apiToken";
import { buildMcpServer } from "@/lib/mcpServer";

// Stateless mode: no sessionIdGenerator. Each HTTP request is a fully
// self-contained JSON-RPC exchange, authenticated independently via its
// own Bearer token — there is no server-side session to tie requests
// together, which matches how Claude.ai calls external MCP connectors.
async function handle(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const rawToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const discordId = await verifyApiToken(rawToken);

  if (!discordId) {
    return new Response(JSON.stringify({ error: "Invalid or missing API token" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const server = buildMcpServer(discordId);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);
  return transport.handleRequest(req);
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
