import { notFound } from "next/navigation";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { UserDocument } from "@/gql/generated/graphql";
import { UserLayoutClient } from "./user-layout-client";

export default async function UserLayout({
  params,
  children,
}: {
  params: Promise<{ userId: string }>;
  children: React.ReactNode;
}) {
  const { userId } = await params;
  const { client, accessToken: token } = await createServerApolloClientForRequest();

  if (!token) return notFound();

  const { data } = await client.query({
    query: UserDocument,
    variables: { userId },
    fetchPolicy: "no-cache",
  });

  const user = data?.user;
  if (!user) return notFound();

  const userName = user.profile.full_name ?? "";

  return (
    <UserLayoutClient userId={userId} userName={userName}>
      {children}
    </UserLayoutClient>
  );
}
