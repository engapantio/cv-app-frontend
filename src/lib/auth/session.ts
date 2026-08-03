"use client";
import { makeVar } from "@apollo/client";
import { useReactiveVar } from "@apollo/client/react";
import { useEffect } from "react";
import type { SessionUser } from "@/lib/auth/cookies";
import { setTokens, clearTokens, resolveBootstrap } from "@/lib/auth/token-store";

export type SessionState = {
  status: "loading" | "authenticated" | "anonymous";
  user: SessionUser | null;
};

export const sessionStateVar = makeVar<SessionState>({
  status: "loading",
  user: null,
});

let bootstrapped = false;
let bootstrapAbortController: AbortController | null = null;
let proactiveRefreshTimer: ReturnType<typeof setInterval> | null = null;

const PROACTIVE_REFRESH_INTERVAL_MS = 8 * 60 * 1000;

function startProactiveRefresh() {
  stopProactiveRefresh();
  proactiveRefreshTimer = setInterval(async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        clearSession();
        return;
      }
      const body = await res.json();
      if (body.accessToken) {
        setTokens(body.accessToken, body.refreshToken ?? null);
      }
    } catch {
      clearSession();
    }
  }, PROACTIVE_REFRESH_INTERVAL_MS);
}

function stopProactiveRefresh() {
  if (proactiveRefreshTimer !== null) {
    clearInterval(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }
}

export function markUserVerified() {
  const current = sessionStateVar();
  if (current.status !== "authenticated" || !current.user) return;
  sessionStateVar({
    status: "authenticated",
    user: { ...current.user, is_verified: true },
  });
}

export function updateSessionProfile(patch: {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  department?: { id: string; name?: string | null } | null;
  position?: { id: string; name?: string | null } | null;
  department_name?: string | null;
  position_name?: string | null;
}) {
  const current = sessionStateVar();
  if (current.status !== "authenticated" || !current.user?.profile) return;
  sessionStateVar({
    status: "authenticated",
    user: {
      ...current.user,
      ...("department" in patch
        ? { department: patch.department ? { id: patch.department.id } : null }
        : {}),
      ...("position" in patch
        ? { position: patch.position ? { id: patch.position.id } : null }
        : {}),
      ...("department_name" in patch ? { department_name: patch.department_name } : {}),
      ...("position_name" in patch ? { position_name: patch.position_name } : {}),
      profile: { ...current.user.profile, ...patch },
    },
  });
}

export function syncSessionProfileFromUpdate(patch: {
  first_name?: string | null;
  last_name?: string | null;
  department?: { id: string; name?: string | null } | null;
  position?: { id: string; name?: string | null } | null;
}) {
  const first = patch.first_name ?? null;
  const last = patch.last_name ?? null;
  updateSessionProfile({
    ...patch,
    full_name: [first, last].filter(Boolean).join(" ").trim() || null,
    department_name: patch.department?.name ?? null,
    position_name: patch.position?.name ?? null,
  });
}

export function setAuthenticatedSession(user: SessionUser) {
  bootstrapAbortController?.abort();
  bootstrapped = false;

  sessionStateVar({
    status: "authenticated",
    user,
  });
}

export function clearSession() {
  bootstrapped = false;
  bootstrapAbortController = null;
  stopProactiveRefresh();
  clearTokens();
  sessionStateVar({
    status: "anonymous",
    user: null,
  });
}

export function resetSessionToLoading() {
  bootstrapped = false;
  bootstrapAbortController = null;
  stopProactiveRefresh();
  clearTokens();
  sessionStateVar({
    status: "loading",
    user: null,
  });
}

export async function bootstrapSession() {
  if (bootstrapped) {
    resolveBootstrap();
    return;
  }
  bootstrapped = true;

  bootstrapAbortController = new AbortController();

  fetch("/api/auth/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal: bootstrapAbortController.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Failed to load session");
      return res.json();
    })
    .then((data) => {
      if (data.accessToken) {
        setTokens(data.accessToken, data.refreshToken ?? null);
      }
      sessionStateVar({
        status: data.authenticated ? "authenticated" : "anonymous",
        user: data.user ?? null,
      });
      if (data.authenticated) {
        startProactiveRefresh();
      }
      resolveBootstrap();
    })
    .catch((error) => {
      if (error.name !== "AbortError") {
        clearSession();
      }
      resolveBootstrap();
    });
}

export function useSession() {
  const session = useReactiveVar(sessionStateVar);

  useEffect(() => {
    bootstrapSession();
  }, []);

  return {
    ...session,
    loading: session.status === "loading",
    isAuthenticated: session.status === "authenticated",
  };
}

export async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  clearSession();
}
