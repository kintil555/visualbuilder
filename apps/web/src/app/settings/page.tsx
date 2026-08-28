"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { SiteHeader } from "@/components/SiteHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function SettingsPage() {
  const { user, status, signIn, authedFetch } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateToken() {
    setLoading(true);
    try {
      const res = await authedFetch(`${API_URL}/api/tokens`, { method: "POST" });
      const data = await res.json();
      setToken(data.token);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <p className="p-8 text-sm text-zinc-500">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <div className="mx-auto max-w-md p-8">
          <h1 className="mb-4 text-lg font-semibold text-zinc-900">Login diperlukan</h1>
          <p className="mb-4 text-sm text-zinc-500">
            Masuk dengan Discord untuk menghubungkan project ke Claude lewat MCP.
          </p>
          <button
            onClick={() => signIn()}
            className="rounded bg-[#5865F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Login dengan Discord
          </button>
        </div>
      </div>
    );
  }

  const mcpUrl = `${API_URL}/api/mcp`;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="mx-auto max-w-lg space-y-6 p-8">
        <h1 className="text-lg font-semibold text-zinc-900">Pengaturan</h1>

        <div className="space-y-3 rounded-xl border border-zinc-200 p-4">
          <h2 className="font-medium text-zinc-900">Hubungkan ke Claude</h2>
          <p className="text-sm text-zinc-500">
            Tambahkan connector MCP ini di Claude.ai / Claude Desktop:
          </p>
          <code className="block break-all rounded bg-zinc-100 p-2 text-xs">{mcpUrl}</code>

          {!token ? (
            <button
              onClick={generateToken}
              disabled={loading}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Membuat..." : "Generate API Token"}
            </button>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-amber-600">
                Simpan token ini sekarang — tidak akan ditampilkan lagi.
              </p>
              <code className="block break-all rounded bg-zinc-100 p-2 text-xs">{token}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
