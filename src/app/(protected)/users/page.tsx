import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { UsersDocument } from "@/gql/generated/graphql";
import { User } from "cv-graphql";
import UsersClient from "./users-client";

const INITIAL_PAGE_SIZE = 10;

export default async function UsersPage() {
  const { client } = await createServerApolloClientForRequest();

  let initialUsers: User[] = [];
  let serverError: string | null = null;

  try {
    const { data } = await client.query({
      query: UsersDocument,
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    });
    const users = (data?.users ?? []) as User[];
    initialUsers = [...users]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, INITIAL_PAGE_SIZE);
  } catch (e) {
    serverError = e instanceof Error ? e.message : "Failed to load users";
  }

  return <UsersClient initialUsers={initialUsers} serverError={serverError} />;
}
