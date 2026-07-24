import type { UserQuery } from "@/gql/generated/graphql";

export type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];
