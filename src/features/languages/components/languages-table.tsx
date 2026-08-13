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
import type { LanguageItem } from "@/features/languages/types";
import { TableEmptyState } from "@/components/shared/table-empty-state";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useTranslations } from "next-intl";

const OpenLanguageOverlay = dynamic(
  () => import("./open-language-overlay").then((m) => m.OpenLanguageOverlay),
  { loading: () => null },
);
const CreateLanguageDialog = dynamic(
  () => import("./create-language-dialog").then((m) => m.CreateLanguageDialog),
  { loading: () => null },
);
const UpdateLanguageDialog = dynamic(
  () => import("./update-language-dialog").then((m) => m.UpdateLanguageDialog),
  { loading: () => null },
);
const DeleteLanguageDialog = dynamic(
  () => import("./delete-language-dialog").then((m) => m.DeleteLanguageDialog),
  { loading: () => null },
);

interface LanguagesTableProps {
  loading: boolean;
  table: Table<LanguageItem>;
  columnCount: number;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  deleteTarget: LanguageItem | null;
  setDeleteTarget: (target: LanguageItem | null) => void;
  updateTarget: LanguageItem | null;
  setUpdateTarget: (target: LanguageItem | null) => void;
  openTarget: LanguageItem | null;
  setOpenTarget: (target: LanguageItem | null) => void;
  handleCreated: (result: {
    id: string;
    created_at: string;
    iso2: string;
    name: string;
    native_name: string | null;
  }) => void;
  handleUpdated: (result: {
    id: string;
    created_at: string;
    iso2: string;
    name: string;
    native_name: string | null;
  }) => void;
  handleDeleted: (languageId: string) => void;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  serverError?: string | null;
}

export function LanguagesTable({
  loading,
  table,
  columnCount,
  createOpen,
  setCreateOpen,
  deleteTarget,
  setDeleteTarget,
  updateTarget,
  setUpdateTarget,
  openTarget,
  setOpenTarget,
  handleCreated,
  handleUpdated,
  handleDeleted,
  globalFilter,
  setGlobalFilter,
  serverError,
}: LanguagesTableProps) {
  const rows = table.getRowModel().rows;
  const tButtons = useTranslations("buttons");
  const tCommon = useTranslations("common");
  const { isAdmin } = usePermissions();

  return (
    <>
      <div className="space-y-4">
        <TableToolbar
          value={globalFilter}
          onChange={setGlobalFilter}
          actionLabel={tButtons("createLanguage")}
          onAction={() => setCreateOpen(true)}
          showAction={isAdmin}
        />

        <div className="overflow-x-hidden">
          <UITable className="table-fixed">
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
                      <TableEmptyState message={tCommon("noLanguagesFound")} responsive />
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
                    className="cursor-pointer border-b-0 group-hover:bg-row-hover dark:group-hover:bg-white/15"
                    onClick={() => setOpenTarget(row.original)}
                  >
                    {row
                      .getVisibleCells()
                      .filter((cell) => cell.column.id !== "id")
                      .map((cell) => (
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

      {openTarget && (
        <OpenLanguageOverlay target={openTarget} onClose={() => setOpenTarget(null)} />
      )}

      {createOpen && (
        <CreateLanguageDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handleCreated}
        />
      )}

      {updateTarget && (
        <UpdateLanguageDialog
          key={"update-" + updateTarget.id}
          target={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onUpdated={handleUpdated}
        />
      )}

      {deleteTarget && (
        <DeleteLanguageDialog
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
