"use client";

import { type UserQuery, UserDocument } from "@/gql/generated/graphql";
import { useCvsTable } from "./use-cvs-table";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export function useCvsPage({ userId, initialCvs }: { userId: string; initialCvs: CvItem[] }) {
  return useCvsTable({
    query: UserDocument,
    variables: { userId },
    dataPath: (data: unknown) => {
      const d = data as { user?: { cvs?: CvItem[] } } | null;
      return d?.user?.cvs;
    },
    initialCvs,
    userId,
  });
}
