import { redirect } from "next/navigation";
import { getServerAccessToken } from "@/lib/auth/cookies";
import { ProtectedShell } from "@/components/layout/protected-shell";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerAccessToken();
  if (!token) redirect("/auth/login");

  return <ProtectedShell>{children}</ProtectedShell>;
}
