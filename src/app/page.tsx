import { redirect } from "next/navigation";
import { getServerAccessToken } from "@/lib/auth/cookies";

export default async function RootPage() {
  const token = await getServerAccessToken();
  redirect(token ? "/users" : "/auth/login");
}
