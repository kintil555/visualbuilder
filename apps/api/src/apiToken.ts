import { SignJWT, jwtVerify } from "jose";

const ISSUER = "visual-builder";
const TOKEN_PREFIX = "vb_";

/**
 * Creates a signed JWT bound to discordId. Returns the raw token string.
 * Never touches a database. Secret comes from the Worker's env binding.
 */
export async function createApiToken(
  discordId: string,
  label: string | undefined,
  secret: string
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  const jwt = await new SignJWT({ discordId, label: label ?? "" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .sign(key);
  return TOKEN_PREFIX + jwt;
}

/**
 * Verifies a raw bearer token and returns the discordId, or null if invalid.
 */
export async function verifyApiToken(raw: string | null, secret: string): Promise<string | null> {
  if (!raw?.startsWith(TOKEN_PREFIX)) return null;
  try {
    const key = new TextEncoder().encode(secret);
    const jwt = raw.slice(TOKEN_PREFIX.length);
    const { payload } = await jwtVerify(jwt, key, { issuer: ISSUER });
    const discordId = payload.discordId as string | undefined;
    return discordId ?? null;
  } catch {
    return null;
  }
}
