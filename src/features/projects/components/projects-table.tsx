"use client";

import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchBar } from "@/components/shared/search-bar";
import { generatePagination } from "@/lib/utils/pagination";
import { ProjectRow } from "./project-row";
import { createProjectColumns } from "../columns";
import type { ProjectItem } from "../hooks/use-projects-page";

interface ProjectsTableProps {
  loading: boolean;
  projects: ProjectItem[];
  canMutate: boolean;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  onCreate: () => void;
  onOpen: (project: ProjectItem) => void;
  onUpdate: (project: ProjectItem) => void;
  onDelete: (project: ProjectItem) => void;
  serverError?: string | null;
}

export function ProjectsTable({
  loading,
  projects,
  canMutate,
  globalFilter,
  setGlobalFilter,
  onCreate,
  onOpen,
  onUpdate,
  onDelete,
  serverError,
}: ProjectsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: true }]);

  const columns = useMemo(() => createProjectColumns(), []);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table requires the table instance to be created directly.
  const table = useReactTable({
    data: projects,
    columns,
    initialState: { columnVisibility: { id: false } },
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const columnCount = columns.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageNumbers = useMemo(
    () => generatePagination(currentPage, totalPages),
    [currentPage, totalPages],
  );
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SearchBar value={globalFilter} onChange={setGlobalFilter} />
        {canMutate && (
          <Button
            variant="ghost"
            className="uppercase text-primary hover:text-primary text-sm font-medium cursor-pointer"
            onClick={onCreate}
          >
            +<span className="hidden md:inline">&nbsp;CREATE PROJECT</span>
          </Button>
        )}
      </div>

      <div className="overflow-x-hidden">
        <UITable className="w-full">
          <colgroup>
            <col />
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
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center py-20">
                  {loading ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Inbox className="h-16 w-16 mb-2" />
                      <p className="text-lg">No projects found.</p>
                    </div>
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                aria-disabled={!table.getCanPreviousPage()}
                className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
              />
              {pageNumbers.map((page, i) => (
                <PaginationItem key={i}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => table.setPageIndex((page as number) - 1)}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationNext
                onClick={() => table.nextPage()}
                aria-disabled={!table.getCanNextPage()}
                className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
