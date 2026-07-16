"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/layout/app-sidebar";
// import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* <AppSidebar /> */}
      <SidebarInset>
        <main className="min-h-dvh px-4 pb-20 pt-6 md:px-8 md:pb-8">{children}</main>
      </SidebarInset>
      {/* <MobileBottomNav /> */}
    </SidebarProvider>
  );
}
