"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
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
import { type UserQuery, type CreateCvMutation } from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { createCvsColumns } from "@/features/cvs/columns";
import { useTranslations } from "next-intl";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

interface UseCvsTableParams {
  query: DocumentNode;
  variables?: Record<string, unknown>;
  getData?: (data: { cvs?: CvItem[]; user?: { cvs?: CvItem[] } }) => CvItem[];
  initialCvs: CvItem[];
  userId?: string;
  initialUserEmail?: string | null;
}

export function useCvsTable({
  query,
  variables,
  getData,
  initialCvs,
  userId,
  initialUserEmail,
}: UseCvsTableParams) {
  const router = useRouter();
  const tColumns = useTranslations("columns.cvs");
  const tButtons = useTranslations("buttons");

  const { data, loading } = useQuery(query, {
    variables,
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const { currentUserId, isAdmin, user: currentUser } = usePermissions();

  const [cvsList, setCvsList] = useState<CvItem[]>(initialCvs);

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (data && !hydratedRef.current && getData) {
      const fetched = getData(data);
      if (fetched.length > 0) {
        hydratedRef.current = true;
        setCvsList(fetched);
      }
    }
  }, [data, getData]);

  const [deleteTarget, setDeleteTarget] = useState<CvItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleOpen = useCallback((cvId: string) => router.push(`/cvs/${cvId}/details`), [router]);

  const handleDelete = useCallback((cv: CvItem) => {
    setDeleteTarget(cv);
  }, []);

  const handleDeleted = useCallback((cvId: string) => {
    setCvsList((prev) => prev.filter((cv) => cv.id !== cvId));
  }, []);

  const handleCreated = useCallback(
    (newCv: CreateCvMutation["createCv"]) => {
      const ownerId = userId ?? currentUserId ?? "";
      const ownerEmail = initialUserEmail ?? currentUser?.email ?? "";
      setCvsList((prev) => [
        { ...newCv, user: { id: ownerId, email: ownerEmail } } as CvItem,
        ...prev,
      ]);
    },
    [userId, currentUserId, initialUserEmail, currentUser],
  );

  const canCreate = userId != null ? currentUserId === userId || isAdmin : !!currentUser;

  const userEmail = initialUserEmail ?? cvsList[0]?.user?.email ?? undefined;

  const columns = useMemo(
    () =>
      createCvsColumns(
        tColumns,
        tButtons,
        currentUserId,
        isAdmin,
        {
          onOpen: handleOpen,
          onDelete: handleDelete,
        },
        userEmail,
        userId,
      ),
    [currentUserId, isAdmin, handleOpen, handleDelete, userEmail, userId, tColumns, tButtons],
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

  const columnCount = columns.length;

  return {
    loading: loading && cvsList.length === 0,
    table,
    rows: table.getRowModel().rows,
    columnCount,
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
