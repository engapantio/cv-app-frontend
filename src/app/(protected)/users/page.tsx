import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { UsersDocument, type UsersQuery } from "@/gql/generated/graphql";
import { getServerUserId } from "@/lib/auth/cookies";
import { orderUsers } from "@/features/users/order-users";
import UsersClient from "./users-client";

type UserItem = UsersQuery["users"][number];

export default async function UsersPage() {
  const { initial, serverError } = await fetchInitialRows<UsersQuery, UserItem>({
    query: UsersDocument,
    getData: (data) => (data?.users ?? []) as UserItem[],
    pageSize: 10000,
    errorMessage: "Failed to load users",
  });

  const currentUserId = await getServerUserId();
  const currentUser = initial.find((u) => u.id === currentUserId);
  const isAdmin = currentUser?.role === "Admin";
  const ordered = orderUsers(initial, currentUserId, isAdmin);

  return (
    <UsersClient
      initialUsers={ordered}
      serverError={serverError}
      initialUserId={currentUserId}
      initialIsAdmin={isAdmin}
    />
  );
}
