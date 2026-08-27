import { auth } from "@/lib/auth";
import { createApiToken } from "@/lib/apiToken";

export async function POST(req: Request) {
  const session = await auth();
  const discordId = (session?.user as { discordId?: string } | undefined)?.discordId;
  if (!discordId) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  const { label } = await req.json().catch(() => ({ label: undefined }));
  const token = await createApiToken(discordId, label);

  return Response.json({ token });
}
