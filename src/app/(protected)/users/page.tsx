"use client";

import { DataTable } from "@/components/shared/";
import { Button } from "@/components/ui";
import { usersColumns } from "@/features/users/columns";
import { useDataTable } from "@/hooks/use-data-table";
import { GET_USERS } from "@/lib/graphql/queries/users.queries";
import { User } from "cv-graphql";

type UsersResponse = {
  users: User[];
};

export default function UsersPage() {
  const { data, isLoading, error, refetch } = useDataTable<UsersResponse, User>({
    query: GET_USERS,
    getData: (data) => data.users,
  });

  if (error) {
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
    <div className="flex min-h-screen w-full">
      <main className="flex-1">
        <div className="flex items-center  h-11">
          <h1 className="text-base text-foreground/70">Employees</h1>
        </div>
        <DataTable columns={usersColumns} data={data} isLoading={isLoading} />
      </main>
    </div>
  );
}
