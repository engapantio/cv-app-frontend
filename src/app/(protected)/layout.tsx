import { redirect } from "next/navigation";
import { getServerAccessToken, getServerRefreshToken } from "@/lib/auth/cookies";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { SidebarProvider } from "@/components/ui";
import { AppSidebar } from "@/components/shared";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const accessToken = await getServerAccessToken();
  const refreshToken = await getServerRefreshToken();
  if (!accessToken && !refreshToken) redirect("/auth/login");

  return (
    <ProtectedShell>
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    </ProtectedShell>
  );
}
