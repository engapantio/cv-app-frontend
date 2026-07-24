"use client";
"use no memo";

import { Inbox, Search } from "lucide-react";
import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui";
import { type UserQuery } from "@/gql/generated/graphql";
import { Button } from "@/components/ui";
import { CreateCvDialog } from "@/features/cvs/components/create-cv-dialog";
import { DeleteCvDialog } from "@/features/cvs/components/delete-cv-dialog";
import { useCvsPage } from "@/features/cvs/hooks";
import { cn } from "@/lib/utils";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export default function UserCvsClient({
  userId,
  initialCvs,
  initialUserEmail,
  serverError,
}: {
  userId: string;
  initialCvs: CvItem[];
  initialUserEmail?: string | null;
  serverError?: string | null;
}) {
  const {
    loading,
    rows,
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
    table,
    handleOpen,
    setDeleteTarget,
  } = useCvsPage({ userId, initialCvs, initialUserEmail });

  return (
    <div className="flex w-full">
      <main className="flex-1 md:max-[1439px]:px-8 min-[1440px]:px-12">
        <h1 className="text-sm text-muted-foreground mb-4">CVs</h1>

        <div className="max-md:flex-col md:max-[1439px]:flex-row min-[1440px]:flex-row flex items-center justify-between mb-4 gap-3">
          <div className="relative max-md:w-full md:max-[1439px]:max-w-sm min-[1440px]:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 rounded-[40px] max-md:text-sm md:max-[1439px]:text-base min-[1440px]:text-base dark:placeholder:text-white"
            />
          </div>
          {canCreate && (
            <Button
              variant="ghost"
              className="uppercase text-primary hover:text-primary hover:bg-transparent max-md:px-0 max-md:h-auto max-md:text-sm md:max-[1439px]:px-0 md:max-[1439px]:h-auto md:max-[1439px]:text-sm min-[1440px]:text-base font-medium"
              onClick={() => setCreateOpen(true)}
            >
              + CREATE CV
            </Button>
          )}
        </div>

        <div className="overflow-x-hidden">
          <Table className="table-fixed w-full">
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
                        (header.column.columnDef as { meta?: { className?: string } }).meta
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
                      <div className="flex flex-col items-center max-md:py-8 md:max-[1439px]:py-12 min-[1440px]:py-16 text-muted-foreground">
                        <Inbox className="max-md:h-10 max-md:w-10 md:max-[1439px]:h-12 md:max-[1439px]:w-12 min-[1440px]:h-16 min-[1440px]:w-16 mb-2" />
                        <p className="max-md:text-sm md:max-[1439px]:text-base min-[1440px]:text-lg">
                          No CVs found.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            ) : (
              rows.map((row) => (
                <TableBody key={row.id} className="group">
                  <TableRow
                    className="cursor-pointer border-b-0 group-hover:bg-muted/50"
                    onClick={() => handleOpen(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "max-md:py-2 md:max-[1439px]:py-3 min-[1440px]:py-4",
                          (cell.column.columnDef as { meta?: { className?: string } }).meta
                            ?.className ?? "",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="border-b group-hover:bg-muted/50">
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
          </Table>
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
      </main>

      <CreateCvDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={userId}
        onCreated={handleCreated}
      />

      <DeleteCvDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
