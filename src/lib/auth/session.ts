"use client";
import { makeVar } from "@apollo/client";
import { useReactiveVar } from "@apollo/client/react";
import { useEffect } from "react";
import type { SessionUser } from "@/lib/auth/cookies";


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

export function setAuthenticatedSession(user: SessionUser) {
  bootstrapAbortController?.abort();

  sessionStateVar({
    status:  "authenticated",
    user,
  });
}

export function clearSession() {
  bootstrapped = false;
  bootstrapAbortController = null;
  sessionStateVar({
    status: "anonymous",
    user: null,
  });
}

export function resetSessionToLoading() {
  bootstrapped = false;
  bootstrapAbortController = null;
  sessionStateVar({
    status: "loading",
    user: null,
  });
}

export async function bootstrapSession() {
  if (bootstrapped) return;
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
      sessionStateVar({
        status: data.authenticated ? "authenticated" : "anonymous",
        user: data.user ?? null,
      });
    })
    .catch((error) => {
      if (error.name !== "AbortError") {
        clearSession();
      }
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
