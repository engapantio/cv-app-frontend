import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { UsersDocument, type UsersQuery } from "@/gql/generated/graphql";
import { User } from "cv-graphql";
import UsersClient from "./users-client";

export default async function UsersPage() {
  const { initial, serverError } = await fetchInitialRows<UsersQuery, User>({
    query: UsersDocument,
    getData: (data) => (data?.users ?? []) as User[],
    sort: (a, b) => Number(b.id) - Number(a.id),
    errorMessage: "Failed to load users",
  });

  return <UsersClient initialUsers={initial} serverError={serverError} />;
}
