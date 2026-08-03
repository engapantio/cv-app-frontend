"use client";

import dynamic from "next/dynamic";
import { type Table, flexRender } from "@tanstack/react-table";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { UserItem } from "@/features/users/types";
import type { CreateUserPayload } from "@/features/users/hooks/use-users-page";
import { TableEmptyState } from "@/components/shared/table-empty-state";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableToolbar } from "@/components/shared/table-toolbar";

const CreateUserDialog = dynamic(
  () => import("./create-user-dialog").then((m) => m.CreateUserDialog),
  { loading: () => null },
);
const DeleteUserDialog = dynamic(
  () => import("./delete-user-dialog").then((m) => m.DeleteUserDialog),
  { loading: () => null },
);

interface UsersTableProps {
  loading: boolean;
  table: Table<UserItem>;
  columnCount: number;
  isAdmin: boolean;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  deleteTarget: UserItem | null;
  setDeleteTarget: (target: UserItem | null) => void;
  handleCreated: (payload: CreateUserPayload) => Promise<void>;
  handleDeleted: (userId: string) => Promise<void>;
  onNavigate: (user: UserItem) => void;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  serverError?: string | null;
  departments: { id: string; name: string }[];
  positions: { id: string; name: string }[];
  creating: boolean;
}

export function UsersTable({
  loading,
  table,
  columnCount,
  isAdmin,
  createOpen,
  setCreateOpen,
  deleteTarget,
  setDeleteTarget,
  handleCreated,
  handleDeleted,
  onNavigate,
  globalFilter,
  setGlobalFilter,
  serverError,
  departments,
  positions,
  creating,
}: UsersTableProps) {
  const rows = table.getRowModel().rows;

  return (
    <>
      <div className="space-y-4">
        <TableToolbar
          value={globalFilter}
          onChange={setGlobalFilter}
          actionLabel="CREATE USER"
          onAction={() => setCreateOpen(true)}
          showAction={isAdmin}
          actionClassName="hover:bg-transparent"
          searchInputClassName="placeholder:text-white/70"
        />

        <div className="overflow-x-hidden">
          <UITable className="table-fixed [&_tr]:border-b-border">
            <colgroup>
              {table.getVisibleLeafColumns().map((column) => (
                <col
                  key={column.id}
                  className={
                    (column.columnDef.meta as { className?: string } | undefined)?.className ?? ""
                  }
                />
              ))}
            </colgroup>
            <TableHeader className="[&_tr]:border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers
                    .filter((header) => header.column.getIsVisible())
                    .map((header) => (
                      <TableHead
                        key={header.id}
                        className={
                          (header.column.columnDef.meta as { className?: string } | undefined)
                            ?.className ?? ""
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                </TableRow>
              ))}
            </TableHeader>
            {serverError ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={columnCount} className="text-center text-destructive">
                    {serverError}
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : loading || rows.length === 0 ? (
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columnCount} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columnCount}>
                      <TableEmptyState message="No users found." responsive />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            ) : (
              rows.map((row, idx) => (
                <TableBody
                  key={row.id}
                  className={cn(
                    "group",
                    idx < rows.length - 1 &&
                      "[&_tr:last-child]:border-b [&_tr:last-child]:border-b-table-border",
                  )}
                >
                  <TableRow
                    className="cursor-pointer border-b-0 group-hover:bg-muted/50 dark:group-hover:bg-white/15"
                    onClick={() => onNavigate(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "max-md:py-2 md:max-[1439px]:py-3 min-[1440px]:py-4",
                          (cell.column.columnDef.meta as { className?: string } | undefined)
                            ?.className ?? "",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              ))
            )}
          </UITable>
        </div>

        {rows.length > 0 && (
          <TablePagination
            table={table}
            className="flex max-md:flex-col md:max-[1439px]:flex-row min-[1440px]:flex-row items-center justify-between max-md:gap-3 md:max-[1439px]:gap-4 min-[1440px]:gap-6 max-md:mt-4 md:max-[1439px]:mt-6 min-[1440px]:mt-8"
          />
        )}
      </div>

      {createOpen && (
        <CreateUserDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          departments={departments}
          positions={positions}
          onConfirm={handleCreated}
          loading={creating}
        />
      )}

      {deleteTarget && (
        <DeleteUserDialog
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
