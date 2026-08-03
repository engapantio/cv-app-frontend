import type { UsersQuery } from "@/gql/generated/graphql";

export type UserItem = UsersQuery["users"][number];
