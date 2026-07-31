"use client";

import { type UserQuery, UserDocument } from "@/gql/generated/graphql";
import { useCvsTable } from "./use-cvs-table";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export function useCvsPage({
  userId,
  initialCvs,
  initialUserEmail,
}: {
  userId: string;
  initialCvs: CvItem[];
  initialUserEmail?: string | null;
}) {
  return useCvsTable({
    query: UserDocument,
    variables: { userId },
    initialCvs,
    userId,
    initialUserEmail,
  });
}
