"use client";

import { type UserQuery } from "@/gql/generated/graphql";
import { CvsTable } from "@/features/cvs/components/cvs-table";
import { useCvsListPage } from "@/features/cvs/hooks";
import { useSession } from "@/lib/auth/session";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export default function CvsListClient({
  initialCvs,
  serverError,
}: {
  initialCvs: CvItem[];
  serverError?: string | null;
}) {
  const { user: currentUser } = useSession();
  const tableData = useCvsListPage(initialCvs);

  return (
    <div className="flex w-full">
      <main className="flex-1">
        <div className="flex items-center h-11">
          <h1 className="text-base text-foreground/70">CVs</h1>
        </div>
        <CvsTable
          {...tableData}
          serverError={serverError}
          createUserId={currentUser?.id ?? ""}
          tableClassName="table-fixed w-full [&_tr]:border-b-gray-200 [border-collapse:collapse]"
        />
      </main>
    </div>
  );
}
