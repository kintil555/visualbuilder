import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { SignJWT, jwtVerify } from "jose";
import type { Env } from "./index";

const SESSION_COOKIE = "vb_session";
const SESSION_ISSUER = "visual-builder-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes

type DiscordUser = { id: string; username: string; global_name?: string | null };

async function signSession(payload: { discordId: string; username: string }, secret: string, maxAgeSec: number) {
  const key = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(SESSION_ISSUER)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSec)
    .sign(key);
}

async function verifySession(token: string, secret: string) {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key, { issuer: SESSION_ISSUER });
  return payload as { discordId: string; username: string };
}

export const handle = new Hono<{ Bindings: Env }>();

// 1. Redirect to Discord's OAuth consent screen.
handle.get("/discord", (c) => {
  const redirectUri = `${new URL(c.req.url).origin}/api/auth/discord/callback`;
  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", c.env.DISCORD_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify");
  return c.redirect(url.toString());
});

// 2. Discord redirects back here with ?code=...; exchange it, set the session cookie.
handle.get("/discord/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.json({ error: "Missing code" }, 400);

  const redirectUri = `${new URL(c.req.url).origin}/api/auth/discord/callback`;

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: c.env.DISCORD_CLIENT_ID,
      client_secret: c.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) return c.json({ error: "Discord token exchange failed" }, 502);
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!userRes.ok) return c.json({ error: "Failed to fetch Discord user" }, 502);
  const user = (await userRes.json()) as DiscordUser;

  const session = await signSession(
    { discordId: user.id, username: user.global_name ?? user.username },
    c.env.AUTH_SECRET,
    SESSION_MAX_AGE
  );

  setCookie(c, SESSION_COOKIE, session, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return c.redirect(c.env.ALLOWED_ORIGIN);
});

// 3. Called by the Pages frontend (credentials: 'include') to get user info
//    plus a short-lived access token to attach as Authorization: Bearer on API calls.
handle.get("/session", async (c) => {
  const raw = getCookie(c, SESSION_COOKIE);
  if (!raw) return c.json({ user: null });

  try {
    const { discordId, username } = await verifySession(raw, c.env.AUTH_SECRET);
    const accessToken = await signSession({ discordId, username }, c.env.AUTH_SECRET, ACCESS_TOKEN_MAX_AGE);
    return c.json({ user: { discordId, username }, accessToken });
  } catch {
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    return c.json({ user: null });
  }
});

handle.post("/logout", (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

/**
 * Middleware for routes that require a valid short-lived access token
 * (sent as `Authorization: Bearer <token>` by the Pages frontend, refreshed
 * via GET /api/auth/session). Sets "discordId" in context on success.
 */
export async function requireAccessToken(c: { req: { header: (k: string) => string | undefined }; env: Env }) {
  const auth = c.req.header("authorization");
  const raw = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!raw) return null;
  try {
    const { discordId } = await verifySession(raw, c.env.AUTH_SECRET);
    return discordId;
  } catch {
    return null;
  }
}
