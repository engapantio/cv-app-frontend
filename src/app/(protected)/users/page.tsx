"use client";

import { DataTable } from "@/components/shared";
import { usersColumns } from "@/features/users/columns";
import { useDataTable } from "@/hooks/use-data-table";
import { GET_USERS } from "@/lib/graphql/queries/users.queries";
import { User } from "cv-graphql";

type UsersResponse = {
  users: User[];
};

export default function UsersPage() {
  const { data, isLoading, error } = useDataTable<UsersResponse, User>({
    query: GET_USERS,
    getData: (data) => data.users,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <main className="flex-1">
        <div className="flex items-center mb-2">
          <h1 className="text-sm font-bold">Employees</h1>
        </div>
        <DataTable columns={usersColumns} data={data} isLoading={isLoading} />
      </main>
    </div>
  );
}
