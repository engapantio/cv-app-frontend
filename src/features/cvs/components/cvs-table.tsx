"use client";

import { Inbox, Search } from "lucide-react";
import { type Table, flexRender } from "@tanstack/react-table";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Button,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui";
import { CreateCvDialog } from "@/features/cvs/components/create-cv-dialog";
import { DeleteCvDialog } from "@/features/cvs/components/delete-cv-dialog";
import { cn } from "@/lib/utils";
import type { CvItem } from "@/features/cvs/types";

interface CvsTableProps {
  loading: boolean;
  table: Table<CvItem>;
  columnCount: number;
  pageNumbers: (number | "...")[];
  canCreate: boolean;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  deleteTarget: CvItem | null;
  handleCreated: () => void;
  handleDeleted: (cvId: string) => void;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  currentPage: number;
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
  pageNumbers,
  canCreate,
  createOpen,
  setCreateOpen,
  deleteTarget,
  handleCreated,
  handleDeleted,
  globalFilter,
  setGlobalFilter,
  currentPage,
  handleOpen,
  setDeleteTarget,
  serverError,
  createUserId,
  tableClassName,
}: CvsTableProps) {
  const rows = table.getRowModel().rows;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 rounded-[40px] placeholder:!text-muted-foreground"
            />
          </div>
          {canCreate && (
            <Button
              variant="ghost"
              className="uppercase text-primary hover:text-primary hover:bg-transparent text-sm font-medium cursor-pointer"
              onClick={() => setCreateOpen(true)}
            >
              +<span className="hidden md:inline">&nbsp;CREATE CV</span>
            </Button>
          )}
        </div>

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
                        (header.column.columnDef.meta as { className?: string } | undefined)?.className ?? ""
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
                      <div className="flex flex-col items-center max-md:py-8 md:max-[1439px]:py-12 min-[1440px]:py-16 text-muted-foreground">
                        <Inbox className="max-md:h-10 max-md:w-10 md:max-[1439px]:h-12 md:max-[1439px]:w-12 min-[1440px]:h-16 min-[1440px]:w-16 mb-2" />
                        <p className="max-md:text-sm md:max-[1439px]:text-base min-[1440px]:text-lg">No CVs found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            ) : (
              rows.map((row, idx) => (
                <TableBody key={row.id} className="group [&_tr:last-child]:border-b">
                  <TableRow
                    className="cursor-pointer border-b-0 group-hover:bg-muted/50"
                    onClick={() => handleOpen(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "max-md:py-2 md:max-[1439px]:py-3 min-[1440px]:py-4 font-semibold",
                          (cell.column.columnDef.meta as { className?: string } | undefined)?.className ?? "",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    className={cn(
                      "cursor-pointer group-hover:bg-muted/50",
                      idx === rows.length - 1 ? "border-b-0" : "",
                    )}
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
          <div className="flex max-md:flex-col md:max-[1439px]:flex-row min-[1440px]:flex-row items-center justify-between max-md:gap-3 md:max-[1439px]:gap-4 min-[1440px]:gap-6 max-md:mt-4 md:max-[1439px]:mt-6 min-[1440px]:mt-8">
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

      <CreateCvDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={createUserId}
        onCreated={handleCreated}
      />

      <DeleteCvDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </>
  );
}
