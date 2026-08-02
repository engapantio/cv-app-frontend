"use client";

import { DataTable } from "@/components/shared/";
import { TablePageLayout } from "@/components/shared/table-page-layout";
import { Button } from "@/components/ui/button";
import { usersColumns } from "@/features/users/columns";
import { useDataTable } from "@/hooks/use-data-table";
import { UsersDocument, type UsersQuery } from "@/gql/generated/graphql";
import { User } from "cv-graphql";

export default function UsersClient({
  initialUsers,
  serverError,
}: {
  initialUsers: User[];
  serverError?: string | null;
}) {
  const { data, isLoading, error, refetch } = useDataTable<UsersQuery, User>({
    query: UsersDocument,
    getData: (data) => data.users as User[],
    initialData: initialUsers,
    serverError,
    alwaysFetch: true,
    fetchPolicy: "cache-first",
  });

  const hasRows = data.length > 0;

  if (error && !hasRows) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-4">Failed to load users</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <TablePageLayout title="Employees">
      {error && hasRows && (
        <div className="flex items-center justify-between gap-3 pb-3">
          <p className="text-sm text-muted-foreground">
            Showing partial data — failed to load the full list.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}
      <DataTable columns={usersColumns} data={data} isLoading={isLoading && !hasRows} />
    </TablePageLayout>
  );
}
