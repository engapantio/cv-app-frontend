"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/lib/auth/cookies";

const ServerUserContext = createContext<SessionUser | null | undefined>(undefined);

export function ServerUserProvider({
  user,
  children,
}: {
  user: SessionUser | null | undefined;
  children: React.ReactNode;
}) {
  return <ServerUserContext.Provider value={user}>{children}</ServerUserContext.Provider>;
}

export function useServerUser(): SessionUser | null | undefined {
  return useContext(ServerUserContext);
}
