"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateToken() {
    setLoading(true);
    try {
      const res = await fetch("/api/tokens", { method: "POST" });
      const data = await res.json();
      setToken(data.token);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return <p className="p-8">Loading...</p>;

  if (!session) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-lg font-semibold mb-4">Login diperlukan</h1>
        <button
          onClick={() => signIn("discord")}
          className="px-4 py-2 bg-[#5865F2] text-white rounded"
        >
          Login dengan Discord
        </button>
      </div>
    );
  }

  const mcpUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/mcp` : "/api/mcp";

  return (
    <div className="p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Halo, {session.user?.name}</h1>
        <button onClick={() => signOut()} className="text-sm text-gray-500 underline">
          Logout
        </button>
      </div>

      <div className="border rounded p-4 space-y-3">
        <h2 className="font-medium">Hubungkan ke Claude</h2>
        <p className="text-sm text-gray-600">
          Tambahkan connector MCP ini di Claude.ai / Claude Desktop:
        </p>
        <code className="block text-xs bg-gray-100 p-2 rounded break-all">{mcpUrl}</code>

        {!token ? (
          <button
            onClick={generateToken}
            disabled={loading}
            className="px-3 py-1.5 bg-black text-white text-sm rounded disabled:opacity-50"
          >
            {loading ? "Membuat..." : "Generate API Token"}
          </button>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-amber-600">
              Simpan token ini sekarang — tidak akan ditampilkan lagi.
            </p>
            <code className="block text-xs bg-gray-100 p-2 rounded break-all">{token}</code>
          </div>
        )}
      </div>
    </div>
  );
}
