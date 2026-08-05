import { notFound } from "next/navigation";
import { getServerUserId } from "@/lib/auth/cookies";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { UserDocument } from "@/gql/generated/graphql";
import { UserLanguagesClient } from "@/features/user-languages/components/user-languages-client";

interface LanguagesPageProps {
  params: Promise<{ userId: string }>;
}

export default async function LanguagesPage({ params }: LanguagesPageProps) {
  const { userId } = await params;
  const { client, accessToken: token } = await createServerApolloClientForRequest();
  const currentUserId = await getServerUserId();

  if (!token) return notFound();

  const { data } = await client.query({
    query: UserDocument,
    variables: { userId },
    fetchPolicy: "no-cache",
  });

  const user = data?.user;
  if (!user) return notFound();

  const isOwner = currentUserId === userId;

  return <UserLanguagesClient userId={userId} initialUser={user} isOwner={isOwner} />;
}
