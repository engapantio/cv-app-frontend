import { notFound } from "next/navigation";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { UserDocument } from "@/gql/generated/graphql";
import { UserProfileClient } from "@/features/user-profile/ui/user-profile-client";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const { client, accessToken: token } = await createServerApolloClientForRequest();

  if (!token) {
    return notFound();
  }

  const { data } = await client.query({
    query: UserDocument,
    variables: { userId },
    fetchPolicy: "no-cache",
  });

  const user = data?.user;
  if (!user) {
    return notFound();
  }

  const avatar = user.profile?.avatar ?? null;

  return (
    <>
      {avatar && <link rel="preload" as="image" href={avatar} />}
      <UserProfileClient user={user} />
    </>
  );
}
