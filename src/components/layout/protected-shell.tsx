"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { AppSidebar, Container } from "../shared";
import type { SessionUser } from "@/lib/auth/cookies";

export function ProtectedShell({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: SessionUser | null;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isTablet = useMediaQuery("(max-width: 1439px)");

  return (
    <div>
      <AppSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        initialUser={initialUser}
      />
      <Container padding={false}>
        <main
          className="transition-all duration-300 ease-in-out px-4 pb-20 pt-2 md:px-8 md:max-[1439px]:pb-44 min-[1440px]:pb-8"
          style={{
            marginLeft: !isTablet && isSidebarOpen ? "12rem" : "0",
          }}
        >
          {children}
        </main>
      </Container>
    </div>
  );
}
