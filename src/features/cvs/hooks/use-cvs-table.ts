"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { type UserQuery } from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { createCvsColumns } from "@/features/cvs/columns";
import { generatePagination } from "@/lib/utils/pagination";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

interface UseCvsTableParams {
  query: DocumentNode;
  variables?: Record<string, unknown>;
  dataPath: (data: unknown) => CvItem[] | null | undefined;
  initialCvs: CvItem[];
  userId?: string;
}

export function useCvsTable({ query, variables, dataPath, initialCvs, userId }: UseCvsTableParams) {
  const router = useRouter();

  const { data, loading, refetch } = useQuery(query, {
    variables,
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const { currentUserId, isAdmin, user: currentUser } = usePermissions();

  const [cvsList, setCvsList] = useState<CvItem[]>(initialCvs);

  useEffect(() => {
    const cvs = dataPath(data);
    if (cvs) {
      setCvsList(cvs);
    }
  }, [data, dataPath]);

  const [deleteTarget, setDeleteTarget] = useState<CvItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleOpen = useCallback((cvId: string) => router.push(`/cvs/${cvId}/details`), [router]);

  const handleDelete = useCallback((cv: CvItem) => {
    setDeleteTarget(cv);
  }, []);

  const handleDeleted = useCallback(
    (cvId: string) => {
      setCvsList((prev) => prev.filter((cv) => cv.id !== cvId));
      refetch();
    },
    [refetch],
  );

  const handleCreated = useCallback(() => {
    refetch();
  }, [refetch]);

  const canCreate = userId != null ? currentUserId === userId || isAdmin : !!currentUser;

  const columns = useMemo(
    () =>
      createCvsColumns(currentUserId, isAdmin, {
        onOpen: handleOpen,
        onDelete: handleDelete,
      }),
    [currentUserId, isAdmin, handleOpen, handleDelete],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
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
