import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle as handleAuth, requireAccessToken } from "./authRoutes";
import { verifyApiToken, createApiToken } from "./apiToken";
import { buildMcpServer } from "./mcpServer";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

export type Env = {
  AUTH_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  ALLOWED_ORIGIN: string; // e.g. https://visualbuilder.pages.dev
};

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: (origin, c) => (origin === c.env.ALLOWED_ORIGIN ? origin : ""),
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Auth: cookie-session endpoints (login, callback, session, refresh, logout) ---
app.route("/api/auth", handleAuth);

// --- Tokens: exchange short-lived access token (Authorization header) for a long-lived API token ---
app.post("/api/tokens", async (c) => {
  const discordId = await requireAccessToken(c);
  if (!discordId) return c.json({ error: "Not authenticated" }, 401);
  const { label } = await c.req.json().catch(() => ({ label: undefined }));
  const token = await createApiToken(discordId, label, c.env.AUTH_SECRET);
  return c.json({ token });
});

// --- MCP: unchanged Bearer-token flow, stateless ---
app.all("/api/mcp", async (c) => {
  const auth = c.req.header("authorization");
  const rawToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const discordId = await verifyApiToken(rawToken, c.env.AUTH_SECRET);

  if (!discordId) {
    return c.json({ error: "Invalid or missing API token" }, 401);
  }

  const server = buildMcpServer(discordId);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return transport.handleRequest(c.req.raw);
});

export default app;
