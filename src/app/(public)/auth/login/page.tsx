import { redirect } from "next/navigation";
import { getServerAccessToken } from "@/lib/auth/cookies";
import { LoginForm } from "@/features/auth/ui/login-form";

export default async function LoginPage() {
  const token = await getServerAccessToken();
  if (token) redirect("/users");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Log in</h1>
      <LoginForm />
    </div>
  );
}
