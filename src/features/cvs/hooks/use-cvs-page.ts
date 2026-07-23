"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { UserDocument, type UserQuery, type CreateCvMutation } from "@/gql/generated/graphql";
import { useSession } from "@/lib/auth/session";
import { createCvsColumns } from "@/features/cvs/columns";
import { generatePagination } from "@/lib/utils/pagination";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export function useCvsPage({
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

  const [cvsList, setCvsList] = useState<CvItem[]>(initialCvs);

  useEffect(() => {
    if (data?.user?.cvs) {
      setCvsList(data.user.cvs);
    }
  }, [data]);

  const [deleteTarget, setDeleteTarget] = useState<CvItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleOpen = useCallback(
    (cvId: string) => router.push(`/cvs/${cvId}/details`),
    [router],
  );

  const handleDelete = useCallback((cv: CvItem) => {
    setDeleteTarget(cv);
  }, []);

  const handleCreated = useCallback(
    (newCv: CreateCvMutation["createCv"]) => {
      const refCv = cvsList[0];
      setCvsList((prev) => [...prev, { ...newCv, user: refCv?.user ?? null } as CvItem]);
      refetch();
    },
    [cvsList, refetch],
  );

  const handleDeleted = useCallback(
    (cvId: string) => {
      setCvsList((prev) => prev.filter((cv) => cv.id !== cvId));
      refetch();
    },
    [refetch],
  );

  const currentUserId = currentUser?.id;
  const isAdmin = currentUser?.role === "Admin";
  const canCreate = currentUserId === userId || isAdmin;

  const userEmail = data?.user?.email ?? initialUserEmail;
  const columns = useMemo(
    () =>
      createCvsColumns(currentUserId, isAdmin, userEmail, userId, {
        onOpen: handleOpen,
        onDelete: handleDelete,
      }),
    [currentUserId, isAdmin, userEmail, userId, handleOpen, handleDelete],
  );

  const table = useReactTable({
    data: cvsList,
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

  return {
    loading,
    table,
    rows: table.getRowModel().rows,
    columnCount,
    currentPage,
    totalPages,
    pageNumbers,
    canCreate,
    createOpen,
    setCreateOpen,
    deleteTarget,
    handleCreated,
    handleDeleted,
    globalFilter,
    setGlobalFilter,
    handleOpen,
    setDeleteTarget,
  };
}
