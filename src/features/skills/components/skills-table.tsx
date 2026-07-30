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
import { cn } from "@/lib/utils";
import type { SkillItem } from "@/features/skills/types";
import type { SkillCategoriesQuery } from "@/gql/generated/graphql";
import { OpenSkillOverlay } from "./open-skill-overlay";
import { CreateSkillDialog } from "./create-skill-dialog";
import { UpdateSkillDialog } from "./update-skill-dialog";
import { DeleteSkillDialog } from "./delete-skill-dialog";

interface SkillsTableProps {
  loading: boolean;
  table: Table<SkillItem>;
  columnCount: number;
  pageNumbers: (number | "...")[];
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
  currentPage: number;
  serverError?: string | null;
  categories: SkillCategoriesQuery["skillCategories"];
}

export function SkillsTable({
  loading,
  table,
  columnCount,
  pageNumbers,
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
  currentPage,
  serverError,
  categories,
}: SkillsTableProps) {
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
              className="pl-10 rounded-[40px] placeholder:text-muted-foreground"
            />
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              className="uppercase text-primary hover:text-primary hover:bg-transparent text-sm font-medium cursor-pointer"
              onClick={() => setCreateOpen(true)}
            >
              +<span className="hidden md:inline">&nbsp;CREATE SKILL</span>
            </Button>
          )}
        </div>

        <div className="overflow-x-hidden">
          <UITable className="[&_tr]:border-b-border">
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
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columnCount}>
                      <div className="flex flex-col items-center max-md:py-8 md:max-[1439px]:py-12 min-[1440px]:py-16 text-muted-foreground">
                        <Inbox className="max-md:h-10 max-md:w-10 md:max-[1439px]:h-12 md:max-[1439px]:w-12 min-[1440px]:h-16 min-[1440px]:w-16 mb-2" />
                        <p className="max-md:text-sm md:max-[1439px]:text-base min-[1440px]:text-lg">
                          No skills found.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            ) : (
              rows.map((row, idx) => (
                <TableBody
                  key={row.id}
                  className={cn("group", idx < rows.length - 1 && "[&_tr:last-child]:border-b")}
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
                            "max-md:py-2 md:max-[1439px]:py-3 min-[1440px]:py-4 font-semibold",
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

      <OpenSkillOverlay target={openTarget} onClose={() => setOpenTarget(null)} />

      <CreateSkillDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        onCreated={handleCreated}
      />

      <UpdateSkillDialog
        target={updateTarget}
        onClose={() => setUpdateTarget(null)}
        categories={categories}
        onUpdated={handleUpdated}
      />

      <DeleteSkillDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </>
  );
}
