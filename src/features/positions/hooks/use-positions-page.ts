"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import {
  PositionsDocument,
  type CreatePositionMutation,
  type UpdatePositionMutation,
} from "@/gql/generated/graphql";
import { createPositionsColumns } from "@/features/positions/columns";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import type { PositionItem } from "@/features/positions/types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function usePositionsPage(initialPositions: PositionItem[]) {
  const t = useTranslations();
  const tColumns = useTranslations("columns.positions");
  const tButtons = useTranslations("buttons");

  const { data: positionsData, loading } = useQuery(PositionsDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [positionsList, setPositionsList] = useState<PositionItem[]>(initialPositions);

  useEffect(() => {
    if (positionsData?.positions) {
      setPositionsList(positionsData.positions as PositionItem[]);
    }
  }, [positionsData]);

  const [deleteTarget, setDeleteTarget] = useState<PositionItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<PositionItem | null>(null);
  const [openTarget, setOpenTarget] = useState<PositionItem | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
    { id: "id", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const handleOpen = useCallback((position: PositionItem) => {
    setOpenTarget(position);
  }, []);

  const handleUpdate = useCallback((position: PositionItem) => {
    setUpdateTarget(position);
  }, []);

  const handleDelete = useCallback((position: PositionItem) => {
    setDeleteTarget(position);
  }, []);

  const handleCreated = useCallback(
    (_newPosition: CreatePositionMutation["createPosition"]) => {
      toast.success(t("common.positionCreatedSuccess"));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [t, setPagination],
  );

  const handleUpdated = useCallback(
    (updated: UpdatePositionMutation["updatePosition"]) => {
      setPositionsList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(t("common.positionUpdatedSuccess"));
    },
    [t],
  );

  const handleDeleted = useCallback(
    (positionId: string) => {
      setPositionsList((prev) => prev.filter((p) => p.id !== positionId));
      toast.success(t("common.positionDeletedSuccess"));
    },
    [t],
  );

  const columns = useMemo(
    () =>
      createPositionsColumns(tColumns, tButtons, {
        onOpen: handleOpen,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      }),
    [handleOpen, handleUpdate, handleDelete, tColumns, tButtons],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: positionsList,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const columnCount = columns.length;

  return {
    loading: loading && positionsList.length === 0,
    table,
    columnCount,
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
    positionsList,
  };
}
