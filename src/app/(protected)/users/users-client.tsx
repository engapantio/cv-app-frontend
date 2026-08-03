"use client";

import type { UsersQuery } from "@/gql/generated/graphql";
import { UsersTable } from "@/features/users/components/users-table";
import { useUsersPage } from "@/features/users/hooks/use-users-page";
import { TablePageLayout } from "@/components/shared/table-page-layout";

type UserItem = UsersQuery["users"][number];

export default function UsersClient({
  initialUsers,
  serverError,
  initialUserId,
  initialIsAdmin,
}: {
  initialUsers: UserItem[];
  serverError?: string | null;
  initialUserId: string | null;
  initialIsAdmin: boolean;
}) {
  const tableData = useUsersPage(initialUsers, initialUserId, initialIsAdmin);

  return (
    <TablePageLayout title="Employees">
      <UsersTable {...tableData} serverError={serverError} />
    </TablePageLayout>
  );
}
