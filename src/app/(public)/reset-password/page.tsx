import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordRedirectPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const path = token
    ? `/auth/reset-password?token=${encodeURIComponent(token)}`
    : "/auth/reset-password";
  redirect(path);
}
