"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { toast } from "sonner";
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
  const t = useTranslations();
  const tColumns = useTranslations("columns.cvs");
  const tButtons = useTranslations("buttons");

  const { data, loading } = useQuery(query, {
    variables,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const { currentUserId, isAdmin, user: currentUser } = usePermissions();

  const [cvsList, setCvsList] = useState<CvItem[]>(initialCvs);

  useEffect(() => {
    if (data && getData) {
      const fetched = getData(data);
      // Keep the SSR-provided rows when the network response is empty so a
      // refetch never flashes an empty list over real data; only an empty
      // server list over no SSR rows is trusted as a genuine empty result.
      if (fetched.length > 0 || initialCvs.length === 0) {
        setCvsList(fetched);
      }
    }
  }, [data, getData, initialCvs.length]);

  const [deleteTarget, setDeleteTarget] = useState<CvItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const handleOpen = useCallback((cvId: string) => router.push(`/cvs/${cvId}/details`), [router]);

  const handleDelete = useCallback((cv: CvItem) => {
    setDeleteTarget(cv);
  }, []);

  const handleDeleted = useCallback(
    (cvId: string) => {
      setCvsList((prev) => prev.filter((cv) => cv.id !== cvId));
      toast.success(t("common.cvDeletedSuccess"));
    },
    [t],
  );

  const handleCreated = useCallback(
    (_newCv: CreateCvMutation["createCv"]) => {
      toast.success(t("common.cvCreatedSuccess"));
      // A new CV sorts to the top of page one, so jump back there to reveal
      // it; update/delete keep the user on their current page.
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [t, setPagination],
  );

  const canCreate = userId != null ? currentUserId === userId || isAdmin : !!currentUser;

  const userEmail = initialUserEmail ?? cvsList[0]?.user?.email ?? undefined;

  const columns = useMemo(
    () =>
      createCvsColumns(
        tColumns,
        tButtons,
        {
          onOpen: handleOpen,
          onDelete: handleDelete,
        },
        userEmail,
        userId,
      ),
    [handleOpen, handleDelete, userEmail, userId, tColumns, tButtons],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table requires the table instance to be created directly in the render body
  const table = useReactTable({
    data: cvsList,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    autoResetPageIndex: false, // pagination is controlled here and reset explicitly on create
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const columnCount = columns.length;

  return {
    loading: loading && cvsList.length === 0 && initialCvs.length > 0,
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
