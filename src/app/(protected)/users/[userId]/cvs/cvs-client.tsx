"use client";
"use no memo";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Inbox, Search } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
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
import { UserDocument, CreateCvDocument, DeleteCvDocument, type UserQuery } from "@/gql/generated/graphql";
import { useSession } from "@/lib/auth/session";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui";
import { createCvsColumns } from "@/features/cvs/columns";
import { generatePagination } from "@/lib/utils/pagination";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

const createCvSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  education: z.string().optional(),
});

type CreateCvFormData = z.infer<typeof createCvSchema>;

export default function UserCvsClient({
  userId,
  initialCvs,
  initialUserEmail,
}: {
  userId: string;
  initialCvs: CvItem[];
  initialUserEmail?: string | null;
}) {
  const router = useRouter();

  const { data, loading, refetch } = useQuery(UserDocument, {
    variables: { userId },
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const { user: currentUser } = useSession();

  const [deleteTarget, setDeleteTarget] = useState<CvItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [createCv, { loading: creating }] = useMutation(CreateCvDocument);
  const [deleteCv, { loading: deleting }] = useMutation(DeleteCvDocument);

  const userCvs = data?.user?.cvs ?? initialCvs;

  const handleOpen = useCallback(
    (cvId: string) => router.push(`/cvs/${cvId}/details`),
    [router],
  );

  const handleDelete = useCallback((cv: CvItem) => {
    setDeleteTarget(cv);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteCv({ variables: { cv: { cvId: deleteTarget.id } } });
      await refetch();
      setDeleteTarget(null);
    } catch {
    }
  }, [deleteTarget, deleteCv, refetch]);

  const currentUserId = currentUser?.id;
  const isAdmin = currentUser?.role === "Admin";

  const userEmail = data?.user?.email ?? initialUserEmail;
  const columns = useMemo(
    () =>
      createCvsColumns(currentUserId, isAdmin, userEmail, userId, {
        onOpen: handleOpen,
        onDelete: handleDelete,
      }),
    [currentUserId, isAdmin, userEmail, userId, handleOpen, handleDelete],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table intentionally incompatible with React Compiler memoization
  const table = useReactTable({
    data: userCvs,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
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
  const columnCount = columns.length;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCvFormData>({
    resolver: zodResolver(createCvSchema),
    defaultValues: { name: "", description: "", education: "" },
  });

  const onCreateSubmit = useCallback(
    async (formData: CreateCvFormData) => {
      try {
        await createCv({
          variables: {
            cv: {
              name: formData.name,
              description: formData.description,
              education: formData.education || null,
              userId,
            },
          },
        });
        await refetch();
        setCreateOpen(false);
        reset();
      } catch {
      }
    },
    [createCv, userId, refetch, reset],
  );

  const canCreate = currentUserId === userId || isAdmin;

  const rows = table.getRowModel().rows;

  return (
    <div className="flex min-h-screen w-full">
      <main className="flex-1">
        <h1 className="text-base text-foreground/70 mb-4">CVs</h1>

        <div className="flex items-center justify-between mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 rounded-[40px] text-base"
            />
          </div>
          {canCreate && (
            <Button
              variant="ghost"
              className="uppercase text-primary hover:text-primary hover:bg-transparent px-0 h-auto text-sm font-medium"
              onClick={() => setCreateOpen(true)}
            >
              + CREATE CV
            </Button>
          )}
        </div>

          <div>
            <Table className="table-fixed">
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columnCount} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columnCount}>
                      <div className="flex flex-col items-center py-12 text-muted-foreground">
                        <Inbox className="h-12 w-12 mb-2" />
                        <p>No CVs found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.flatMap((row) => [
                    <TableRow
                      key={`${row.id}-main`}
                      className="cursor-pointer border-b-0"
                      onClick={() => handleOpen(row.original.id)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>,
                    <TableRow key={`${row.id}-desc`} className="border-b">
                      <TableCell
                        colSpan={columnCount}
                        className="text-muted-foreground text-base leading-8 pt-2 pb-5 whitespace-normal"
                      >
                        {row.original.description}
                      </TableCell>
                    </TableRow>,
                  ])
                )}
              </TableBody>
            </Table>
          </div>

          {rows.length > 0 && (
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
          )}
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create CV</DialogTitle>
            <DialogDescription>Fill in the details to create a new CV.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Name"
                {...register("name")}
                disabled={isSubmitting}
                className="rounded-[40px] h-10"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>
            <div className="relative">
              <Input
                placeholder="Description"
                {...register("description")}
                disabled={isSubmitting}
                className="rounded-[40px] h-10"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>
            <div className="relative">
              <Input
                placeholder="Education (optional)"
                {...register("education")}
                disabled={isSubmitting}
                className="rounded-[40px] h-10"
              />
              {errors.education && (
                <p className="text-sm text-destructive mt-1">{errors.education.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent showCloseButton className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete CV</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
