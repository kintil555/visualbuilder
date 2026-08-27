import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Discord],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "discord" && profile) {
        token.discordId = String(profile.id);
        token.username = String(profile.username ?? profile.name ?? "unknown");
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as { id?: string; discordId?: string }).id = token.discordId as string;
      (session.user as { discordId?: string }).discordId = token.discordId as string;
      return session;
    },
  },
});
