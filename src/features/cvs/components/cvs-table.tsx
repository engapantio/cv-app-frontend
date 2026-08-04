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
import { type CreateCvMutation } from "@/gql/generated/graphql";
import { TableEmptyState } from "@/components/shared/table-empty-state";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { cn } from "@/lib/utils";
import type { CvItem } from "@/features/cvs/types";
import { useTranslations } from "next-intl";

const CreateCvDialog = dynamic(
  () => import("@/features/cvs/components/create-cv-dialog").then((m) => m.CreateCvDialog),
  { loading: () => null },
);
const DeleteCvDialog = dynamic(
  () => import("@/features/cvs/components/delete-cv-dialog").then((m) => m.DeleteCvDialog),
  { loading: () => null },
);

interface CvsTableProps {
  loading: boolean;
  table: Table<CvItem>;
  columnCount: number;
  canCreate: boolean;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  deleteTarget: CvItem | null;
  handleCreated: (newCv: CreateCvMutation["createCv"]) => void;
  handleDeleted: (cvId: string) => void;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  handleOpen: (cvId: string) => void;
  setDeleteTarget: (target: CvItem | null) => void;
  serverError?: string | null;
  createUserId: string;
  tableClassName: string;
}

export function CvsTable({
  loading,
  table,
  columnCount,
  canCreate,
  createOpen,
  setCreateOpen,
  deleteTarget,
  handleCreated,
  handleDeleted,
  globalFilter,
  setGlobalFilter,
  handleOpen,
  setDeleteTarget,
  serverError,
  createUserId,
  tableClassName,
}: CvsTableProps) {
  const rows = table.getRowModel().rows;
  const tButtons = useTranslations("buttons");
  const tCommon = useTranslations("common");

  return (
    <>
      <div className="space-y-4">
        <TableToolbar
          value={globalFilter}
          onChange={setGlobalFilter}
          actionLabel={tButtons("createCv")}
          onAction={() => setCreateOpen(true)}
          showAction={canCreate}
        />

        <div className="overflow-x-hidden">
          <UITable className={tableClassName}>
            <colgroup>
              <col />
              <col />
              <col />
              <col className="w-12" />
            </colgroup>
            <TableHeader className="[&_tr]:border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
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
                      {tCommon("loading")}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columnCount}>
                      <TableEmptyState message={tCommon("noCvsFound")} responsive />
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
                    onClick={() => handleOpen(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "max-md:py-2 md:max-[1439px]:py-3 min-[1440px]:py-4 font-semibold",
                          (cell.column.columnDef.meta as { className?: string } | undefined)
                            ?.className ?? "",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    className="cursor-pointer border-b-0 group-hover:bg-muted/50 dark:group-hover:bg-white/15"
                    onClick={() => handleOpen(row.original.id)}
                  >
                    <TableCell
                      colSpan={columnCount}
                      className="text-muted-foreground max-md:text-sm max-md:leading-7 max-md:pt-1 max-md:pb-4 md:max-[1439px]:text-base md:max-[1439px]:leading-8 md:max-[1439px]:pt-2 md:max-[1439px]:pb-5 min-[1440px]:text-lg min-[1440px]:leading-9 min-[1440px]:pt-3 min-[1440px]:pb-6 whitespace-normal wrap-break-word"
                    >
                      {row.original.description}
                    </TableCell>
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
        <CreateCvDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          userId={createUserId}
          onCreated={handleCreated}
        />
      )}

      {deleteTarget && (
        <DeleteCvDialog
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
