"use client";

import Link from "next/link";
import { useAuth } from "@/lib/authContext";

export function SiteHeader() {
  const { user, status, signIn, signOut } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-zinc-900 text-sm text-white">
            V
          </span>
          Visual Builder
        </Link>

        <nav className="flex items-center gap-6 text-sm text-zinc-600">
          <Link href="/editor" className="hover:text-zinc-900">
            Editor
          </Link>
          <Link href="/settings" className="hover:text-zinc-900">
            Pengaturan
          </Link>

          {status === "loading" ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-zinc-500">{user.username}</span>
              <button
                onClick={() => signOut()}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50"
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-white hover:bg-zinc-800"
            >
              Masuk
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
