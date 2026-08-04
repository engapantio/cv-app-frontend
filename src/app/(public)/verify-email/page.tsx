import { redirect } from "next/navigation";
import { getServerAccessToken } from "@/lib/auth/cookies";
import { VerifyEmailForm } from "@/features/auth/ui/verify-email-form";

export default async function VerifyEmailPage() {
  const token = await getServerAccessToken();
  if (!token) redirect("/auth/login");
  return (
    <div className="flex flex-1 items-center justify-center px-4 pb-12">
      <div className="w-full max-w-140">
        <VerifyEmailForm />
      </div>
    </div>
  );
}
