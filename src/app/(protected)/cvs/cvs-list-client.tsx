"use client";

import { type UserQuery } from "@/gql/generated/graphql";
import { CvsTable } from "@/features/cvs/components/cvs-table";
import { useCvsListPage } from "@/features/cvs/hooks";
import { useSession } from "@/lib/auth/session";
import { TablePageLayout } from "@/components/shared/table-page-layout";

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
    <TablePageLayout title="CVs">
      <CvsTable
        {...tableData}
        serverError={serverError}
        createUserId={currentUser?.id ?? ""}
        tableClassName="table-fixed w-full [&_tr]:border-b-table-border [border-collapse:collapse]"
      />
    </TablePageLayout>
  );
}
