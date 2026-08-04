import { notFound } from "next/navigation";
import { getServerUserId } from "@/lib/auth/cookies";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { UserDocument } from "@/gql/generated/graphql";
import { UserProfileClient } from "@/features/user-profile/ui/user-profile-client";
import { UserProfileBreadcrumb } from "@/features/user-profile/ui/user-profile-breadcrumb";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const { client, accessToken: token } = await createServerApolloClientForRequest();
  const currentUserId = await getServerUserId();

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

  const isOwner = currentUserId === userId;

  return (
    <div className="flex min-h-screen w-full">
      <main className="flex-1">
        <UserProfileBreadcrumb userName={user.profile.full_name ?? ""} />
        <UserProfileClient user={user} isOwner={isOwner} />
      </main>
    </div>
  );
}
