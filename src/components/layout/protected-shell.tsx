"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { AppSidebar, Container } from "../shared";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isTablet = useMediaQuery("(max-width: 768px)");

  return (
    <div>
      <AppSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isTablet={isTablet}
      />
      <Container>
        <main
          className="transition-all duration-300 ease-in-out px-4 pb-20 pt-2 md:px-8 md:pb-8"
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
