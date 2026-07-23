import { notFound } from "next/navigation";
import { getServerAccessToken, getServerUserId } from "@/lib/auth/cookies";
import { createServerApolloClient } from "@/lib/apollo/server-client";
import { UserDocument } from "@/gql/generated/graphql";
import { UserProfileClient } from "@/features/user-profile/ui/user-profile-client";
import { ChevronRight, User } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const token = await getServerAccessToken();
  const currentUserId = await getServerUserId();

  if (!token) {
    return notFound();
  }

  const client = createServerApolloClient(token);
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
        <div className="flex items-center h-11 gap-4">
          <h1 className="text-base text-foreground/70">Employees</h1>
          <ChevronRight className="text-icon w-4 h-4" />
          <div className="text-primary flex gap-2">
            <User className="w-5 h-5" />
            {user.profile.full_name}
          </div>
        </div>
        <UserProfileClient user={user} isOwner={isOwner} />
      </main>
    </div>
  );
}
