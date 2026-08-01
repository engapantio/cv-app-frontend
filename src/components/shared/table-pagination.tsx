"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Table } from "@tanstack/react-table";
import { generatePagination } from "@/lib/utils/pagination";

interface TablePaginationProps<T> {
  table: Table<T>;
  className?: string;
}

export function TablePagination<T>({ table, className }: TablePaginationProps<T>) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageNumbers = generatePagination(currentPage, table.getPageCount());

  return (
    <div className={className}>
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
  );
}
