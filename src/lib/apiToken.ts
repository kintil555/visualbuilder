import { SignJWT, jwtVerify } from "jose";

const rawSecret = process.env.AUTH_SECRET;
if (!rawSecret) throw new Error("AUTH_SECRET env var is not set");
const SECRET = new TextEncoder().encode(rawSecret);
const ISSUER = "visual-builder";
const TOKEN_PREFIX = "vb_";

/**
 * Creates a signed JWT bound to discordId. Returns the raw token string.
 * Never touches a database.
 */
export async function createApiToken(discordId: string, label?: string): Promise<string> {
  const jwt = await new SignJWT({ discordId, label: label ?? "" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .sign(SECRET);
  return TOKEN_PREFIX + jwt;
}

/**
 * Verifies a raw bearer token and returns the discordId, or null if invalid.
 */
export async function verifyApiToken(raw: string | null): Promise<string | null> {
  if (!raw?.startsWith(TOKEN_PREFIX)) return null;
  try {
    const jwt = raw.slice(TOKEN_PREFIX.length);
    const { payload } = await jwtVerify(jwt, SECRET, { issuer: ISSUER });
    const discordId = payload.discordId as string | undefined;
    return discordId ?? null;
  } catch {
    return null;
  }
}
