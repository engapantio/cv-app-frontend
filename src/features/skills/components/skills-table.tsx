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
import type { SkillItem } from "@/features/skills/types";
import type { SkillCategoriesQuery } from "@/gql/generated/graphql";
import { TableEmptyState } from "@/components/shared/table-empty-state";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useTranslations } from "next-intl";

const OpenSkillOverlay = dynamic(
  () => import("./open-skill-overlay").then((m) => m.OpenSkillOverlay),
  { loading: () => null },
);
const CreateSkillDialog = dynamic(
  () => import("./create-skill-dialog").then((m) => m.CreateSkillDialog),
  { loading: () => null },
);
const UpdateSkillDialog = dynamic(
  () => import("./update-skill-dialog").then((m) => m.UpdateSkillDialog),
  { loading: () => null },
);
const DeleteSkillDialog = dynamic(
  () => import("./delete-skill-dialog").then((m) => m.DeleteSkillDialog),
  { loading: () => null },
);

interface SkillsTableProps {
  loading: boolean;
  table: Table<SkillItem>;
  columnCount: number;
  isAdmin: boolean;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  deleteTarget: SkillItem | null;
  setDeleteTarget: (target: SkillItem | null) => void;
  updateTarget: SkillItem | null;
  setUpdateTarget: (target: SkillItem | null) => void;
  openTarget: SkillItem | null;
  setOpenTarget: (target: SkillItem | null) => void;
  handleCreated: (result: {
    id: string;
    created_at: string;
    name: string;
    category_name: string | null;
    category_parent_name: string | null;
  }) => void;
  handleUpdated: (result: {
    id: string;
    created_at: string;
    name: string;
    category_name: string | null;
    category_parent_name: string | null;
  }) => void;
  handleDeleted: (skillId: string) => void;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  serverError?: string | null;
  categories: SkillCategoriesQuery["skillCategories"];
}

export function SkillsTable({
  loading,
  table,
  columnCount,
  isAdmin,
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
  categories,
}: SkillsTableProps) {
  const rows = table.getRowModel().rows;
  const tButtons = useTranslations("buttons");
  const tCommon = useTranslations("common");

  return (
    <>
      <div className="space-y-4">
        <TableToolbar
          value={globalFilter}
          onChange={setGlobalFilter}
          actionLabel={tButtons("createSkill")}
          onAction={() => setCreateOpen(true)}
          showAction={isAdmin}
          actionClassName="hover:bg-transparent"
        />

        <div className="overflow-x-hidden">
          <UITable className="table-fixed [&_tr]:border-b-border">
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
                      <TableEmptyState message={tCommon("noSkillsFound")} responsive />
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

      {openTarget && <OpenSkillOverlay target={openTarget} onClose={() => setOpenTarget(null)} />}

      {createOpen && (
        <CreateSkillDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          categories={categories}
          onCreated={handleCreated}
        />
      )}

      {updateTarget && (
        <UpdateSkillDialog
          key={"update-" + updateTarget.id}
          target={updateTarget}
          onClose={() => setUpdateTarget(null)}
          categories={categories}
          onUpdated={handleUpdated}
        />
      )}

      {deleteTarget && (
        <DeleteSkillDialog
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
