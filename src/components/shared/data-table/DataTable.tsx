"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Inbox } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { generatePagination } from "@/lib/utils/pagination";

interface DataTableProps<T, V> {
  columns: ColumnDef<T, V>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T, V>({
  columns,
  data = [],
  isLoading = false,
  emptyMessage = "No data found.",
}: DataTableProps<T, V>) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    initialState: { columnVisibility: { id: false } },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageNumbers = useMemo(
    () => generatePagination(currentPage, totalPages),
    [currentPage, totalPages],
  );

  return (
    <div className="space-y-4">
      <SearchBar value={globalFilter} onChange={setGlobalFilter} />

      <div>
        <Table className="[&_tr]:border-b-border">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center py-12 text-muted-foreground">
                    <Inbox className="h-12 w-12 mb-2" />
                    <p>{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-muted-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
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
    </div>
  );
}
