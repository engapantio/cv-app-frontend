import { notFound } from "next/navigation";
import { getServerUserId } from "@/lib/auth/cookies";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { UserDocument } from "@/gql/generated/graphql";
import { UserProfileClient } from "@/features/user-profile/ui/user-profile-client";
import { ChevronRight, User } from "lucide-react";
import Link from "next/link";

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
        <div className="flex items-center h-11 gap-4">
          <Link
            href="/users"
            className="text-base text-foreground/70 hover:text-primary transition-colors"
          >
            Employees
          </Link>
          <ChevronRight className="text-icon w-5 h-5" />
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
