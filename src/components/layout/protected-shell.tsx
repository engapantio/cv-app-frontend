"use client";

import { useState } from "react";
import { AppSidebar, Container } from "../shared";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/cookies";

export function ProtectedShell({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: SessionUser | null;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div>
      <AppSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        initialUser={initialUser}
      />
      <Container padding={false}>
        <main
          className={cn(
            "transition-all duration-300 ease-in-out px-4 pb-20 pt-2 md:max-[1439px]:px-6 md:max-[1439px]:pb-44 min-[1440px]:px-6 min-[1440px]:pb-8",
            isSidebarOpen && "min-[1440px]:ml-48",
          )}
        >
          {children}
        </main>
      </Container>
    </div>
  );
}
