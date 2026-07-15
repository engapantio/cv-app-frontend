"use client";
import { makeVar } from "@apollo/client";
import { useReactiveVar } from "@apollo/client/react";
import { useEffect } from "react";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: "Admin" | "Employee";
} | null;

export type SessionState = {
  status: "loading" | "authenticated" | "anonymous";
  user: SessionUser;
};

export const sessionStateVar = makeVar<SessionState>({
  status: "loading",
  user: null,
});

let bootstrapped = false;

export function setAuthenticatedSession(user: SessionUser) {
  sessionStateVar({
    status: user ? "authenticated" : "anonymous",
    user,
  });
}

export function clearSession() {
  sessionStateVar({
    status: "anonymous",
    user: null,
  });
}

export function resetSessionToLoading() {
  sessionStateVar({
    status: "loading",
    user: null,
  });
}

export function bootstrapSession() {
  if (bootstrapped) return;
  bootstrapped = true;

  fetch("/api/auth/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
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
    .catch(() => {
      clearSession();
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
