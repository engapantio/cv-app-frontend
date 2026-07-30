"use client";

import { type UserQuery, CvsDocument } from "@/gql/generated/graphql";
import { useCvsTable } from "./use-cvs-table";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export function useCvsListPage(initialCvs: CvItem[]) {
  return useCvsTable({
    query: CvsDocument,
    initialCvs,
  });
}
