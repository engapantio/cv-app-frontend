"use client";;
import { makeVar } from "@apollo/client";
import { useReactiveVar } from "@apollo/client/react";
import { useEffect } from "react";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "USER";
} | null;

export const sessionVar = makeVar<SessionUser>(null);
export const sessionLoadingVar = makeVar<boolean>(true);

export function useSession() {
  const user = useReactiveVar(sessionVar);
  const loading = useReactiveVar(sessionLoadingVar);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => sessionVar(data.user))
      .finally(() => sessionLoadingVar(false));
  }, []);

  return { user, loading, isAuthenticated: !!user };
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  sessionVar(null);
}

