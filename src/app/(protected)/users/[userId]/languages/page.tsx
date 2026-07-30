import { notFound } from "next/navigation";
import { getServerAccessToken, getServerUserId } from "@/lib/auth/cookies";
import { createServerApolloClient } from "@/lib/apollo/server-client";
import { UserDocument } from "@/gql/generated/graphql";
import { UserLanguagesClient } from "@/features/user-languages/components/user-languages-client";

interface LanguagesPageProps {
  params: Promise<{ userId: string }>;
}

export default async function LanguagesPage({ params }: LanguagesPageProps) {
  const { userId } = await params;
  const token = await getServerAccessToken();
  const currentUserId = await getServerUserId();

  if (!token) return notFound();

  const client = createServerApolloClient(token);
  const { data } = await client.query({
    query: UserDocument,
    variables: { userId },
    fetchPolicy: "no-cache",
  });

  const user = data?.user;
  if (!user) return notFound();

  const isOwner = currentUserId === userId;

  return (
    <div className="flex min-h-screen w-full">
      <main className="flex-1">
        <UserLanguagesClient userId={userId} isOwner={isOwner} />
      </main>
    </div>
  );
}
