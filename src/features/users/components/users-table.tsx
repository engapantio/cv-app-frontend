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
import { usePermissions } from "@/lib/auth/permissions";
import { useTranslations } from "next-intl";
import type { UserItem } from "@/features/users/types";
import type { CreateUserPayload, UpdateUserPayload } from "@/features/users/hooks/use-users-page";
import { TableEmptyState } from "@/components/shared/table-empty-state";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableToolbar } from "@/components/shared/table-toolbar";

const CreateUserDialog = dynamic(
  () => import("./create-user-dialog").then((m) => m.CreateUserDialog),
  { loading: () => null },
);
const UpdateUserDialog = dynamic(
  () => import("./update-user-dialog").then((m) => m.UpdateUserDialog),
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
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  updateTarget: UserItem | null;
  setUpdateTarget: (target: UserItem | null) => void;
  deleteTarget: UserItem | null;
  setDeleteTarget: (target: UserItem | null) => void;
  handleCreated: (payload: CreateUserPayload) => Promise<void>;
  handleUpdated: (payload: UpdateUserPayload) => Promise<void>;
  handleDeleted: (userId: string) => Promise<void>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  serverError?: string | null;
  creating: boolean;
  updating: boolean;
}

export function UsersTable({
  loading,
  table,
  columnCount,
  createOpen,
  setCreateOpen,
  updateTarget,
  setUpdateTarget,
  deleteTarget,
  setDeleteTarget,
  handleCreated,
  handleUpdated,
  handleDeleted,
  globalFilter,
  setGlobalFilter,
  serverError,
  creating,
  updating,
}: UsersTableProps) {
  const rows = table.getRowModel().rows;
  const t = useTranslations();
  const { isAdmin } = usePermissions();

  return (
    <>
      <div className="space-y-4">
        <TableToolbar
          value={globalFilter}
          onChange={setGlobalFilter}
          actionLabel={t("buttons.createUser")}
          onAction={() => setCreateOpen(true)}
          showAction={isAdmin}
        />

        <div className="overflow-x-hidden">
          <UITable className="table-fixed">
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
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columnCount}>
                      <TableEmptyState message={t("common.noUsersFound")} responsive />
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
                  <TableRow className="border-b-0 group-hover:bg-row-hover dark:group-hover:bg-white/15">
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
          onConfirm={handleCreated}
          loading={creating}
        />
      )}

      {updateTarget && (
        <UpdateUserDialog
          key={"update-" + updateTarget.id}
          target={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onConfirm={handleUpdated}
          loading={updating}
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
