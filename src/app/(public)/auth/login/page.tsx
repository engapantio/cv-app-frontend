import { redirect } from "next/navigation";
import { getServerAccessToken } from "@/lib/auth/cookies";
import { LoginForm } from "@/features/auth/ui/login-form";

export default async function LoginPage() {
  const token = await getServerAccessToken();
  if (token) redirect("/users");
  return <LoginForm />;
}
