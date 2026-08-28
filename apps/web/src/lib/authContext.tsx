"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type SessionUser = { discordId: string; username: string } | null;

type AuthState = {
  user: SessionUser;
  status: "loading" | "authenticated" | "unauthenticated";
  accessToken: string | null;
  signIn: () => void;
  signOut: () => Promise<void>;
  /** fetch wrapper that attaches the current access token; retries once after a refresh on 401 */
  authedFetch: (input: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthState["status"]>("loading");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/session`, { credentials: "include" });
      const data = (await res.json()) as { user: SessionUser; accessToken?: string };
      setUser(data.user);
      setAccessToken(data.accessToken ?? null);
      setStatus(data.user ? "authenticated" : "unauthenticated");
      return data.accessToken ?? null;
    } catch {
      setUser(null);
      setAccessToken(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const authedFetch = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const doFetch = (token: string | null) =>
        fetch(input, {
          ...init,
          headers: { ...init.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

      let res = await doFetch(accessToken);
      if (res.status === 401) {
        const fresh = await refresh();
        res = await doFetch(fresh);
      }
      return res;
    },
    [accessToken, refresh]
  );

  const signIn = useCallback(() => {
    window.location.href = `${API_URL}/api/auth/discord`;
  }, []);

  const signOut = useCallback(async () => {
    await fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    setAccessToken(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, accessToken, signIn, signOut, authedFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
