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
    <div className="flex w-full">
      <main className="flex-1">
        <div className="flex items-center h-11">
          <h1 className="text-base text-foreground/70">CVs</h1>
        </div>
        <CvsTable
          {...tableData}
          serverError={serverError}
          createUserId={userId}
          tableClassName="table-fixed w-full"
        />
      </main>
    </div>
  );
}
