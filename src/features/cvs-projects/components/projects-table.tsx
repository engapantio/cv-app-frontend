"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState } from "@/components/shared/table-empty-state";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useTranslations } from "next-intl";
import { ProjectRow } from "./project-row";
import { createProjectColumns } from "../columns";
import type { CvProjectItem } from "../types";

interface ProjectsTableProps {
  loading: boolean;
  projects: CvProjectItem[];
  canMutate: boolean;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onCreate: () => void;
  onOpen: (project: CvProjectItem) => void;
  onUpdate: (project: CvProjectItem) => void;
  onDelete: (project: CvProjectItem) => void;
  serverError?: string | null;
}

export function ProjectsTable({
  loading,
  projects,
  canMutate,
  globalFilter,
  setGlobalFilter,
  pagination,
  onPaginationChange,
  onCreate,
  onOpen,
  onUpdate,
  onDelete,
  serverError,
}: ProjectsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const tColumns = useTranslations("columns.projects");
  const tButtons = useTranslations("buttons");
  const tCommon = useTranslations("common");
  const columns = useMemo(() => createProjectColumns(tColumns), [tColumns]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: projects,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange,
    autoResetPageIndex: false, // pagination is controlled here and reset explicitly on create
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const columnCount = columns.length;
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <TableToolbar
        value={globalFilter}
        onChange={setGlobalFilter}
        actionLabel={tButtons("addProject")}
        onAction={onCreate}
        showAction={canMutate}
      />

      <div className="overflow-x-hidden">
        <UITable className="w-full">
          <colgroup>
            <col />
            <col className="hidden max-md:hidden md:table-column" />
            <col className="hidden xl:table-column" />
            <col className="hidden xl:table-column" />
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
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center py-20">
                  {loading ? (
                    <span className="text-muted-foreground">{tCommon("loading")}</span>
                  ) : (
                    <TableEmptyState message={tCommon("noProjectsFound")} />
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            rows.map((row, idx) => (
              <ProjectRow
                key={row.original.id}
                project={row.original}
                columnCount={columnCount}
                canMutate={canMutate}
                isLast={idx === rows.length - 1}
                onOpen={onOpen}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))
          )}
        </UITable>
      </div>

      {rows.length > 0 && (
        <TablePagination
          table={table}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8"
        />
      )}
    </div>
  );
}
