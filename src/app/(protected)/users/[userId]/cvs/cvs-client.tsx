"use client";

import { type UserQuery } from "@/gql/generated/graphql";
import { CvsTable } from "@/features/cvs/components/cvs-table";
import { useCvsPage } from "@/features/cvs/hooks";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export default function UserCvsClient({
  userId,
  initialCvs,
  initialUserEmail,
  serverError,
}: {
  userId: string;
  initialCvs: CvItem[];
  initialUserEmail?: string | null;
  serverError?: string | null;
}) {
  const tableData = useCvsPage({ userId, initialCvs, initialUserEmail });

  return (
    <CvsTable
      {...tableData}
      serverError={serverError}
      createUserId={userId}
      tableClassName="table-fixed w-full [&_tr]:border-b-table-border [border-collapse:collapse]"
    />
  );
}
