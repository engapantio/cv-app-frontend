"use client";

import type { UsersQuery } from "@/gql/generated/graphql";
import { UsersTable } from "@/features/users/components/users-table";
import { useUsersPage } from "@/features/users/hooks/use-users-page";
import { TablePageLayout } from "@/components/shared/table-page-layout";
import { useTranslations } from "next-intl";

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
  const t = useTranslations();
  const tableData = useUsersPage(initialUsers, initialUserId, initialIsAdmin);

  return (
    <TablePageLayout title={t("nav.employees")}>
      <UsersTable {...tableData} serverError={serverError} />
    </TablePageLayout>
  );
}
