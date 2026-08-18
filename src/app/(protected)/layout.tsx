import { redirect } from "next/navigation";
import { getServerAccessToken, getServerRefreshToken } from "@/lib/auth/cookies";
import { getServerSessionUser } from "@/lib/auth/session-server";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const accessToken = await getServerAccessToken();
  const refreshToken = await getServerRefreshToken();
  if (!accessToken && !refreshToken) redirect("/auth/login");

  const initialUser = await getServerSessionUser();

  return (
    <SidebarProvider className="contents">
      <ProtectedShell initialUser={initialUser}>{children}</ProtectedShell>
    </SidebarProvider>
  );
}
