"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  PositionsDocument,
  CreatePositionDocument,
  UpdatePositionDocument,
  DeletePositionDocument,
  type CreatePositionMutation,
  type UpdatePositionMutation,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
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
import { useTranslations } from "next-intl";

export function usePositionsPage(initialPositions: PositionItem[]) {
  const { isAdmin } = usePermissions();
  const tColumns = useTranslations("columns.positions");
  const tButtons = useTranslations("buttons");

  const { data: positionsData, loading } = useQuery(PositionsDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const [positionsList, setPositionsList] = useState<PositionItem[]>(initialPositions);

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (positionsData?.positions && !hydratedRef.current) {
      hydratedRef.current = true;
      setPositionsList(
        (positionsData.positions as PositionItem[]).sort((a, b) => a.name.localeCompare(b.name)),
      );
    }
  }, [positionsData]);

  const [deleteTarget, setDeleteTarget] = useState<PositionItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<PositionItem | null>(null);
  const [openTarget, setOpenTarget] = useState<PositionItem | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleOpen = useCallback((position: PositionItem) => {
    setOpenTarget(position);
  }, []);

  const handleUpdate = useCallback((position: PositionItem) => {
    setUpdateTarget(position);
  }, []);

  const handleDelete = useCallback((position: PositionItem) => {
    setDeleteTarget(position);
  }, []);

  const [createPosition] = useMutation(CreatePositionDocument);

  const handleCreated = useCallback((newPosition: CreatePositionMutation["createPosition"]) => {
    setPositionsList((prev) => [...prev, newPosition]);
  }, []);

  const [updatePosition, { loading: updating }] = useMutation(UpdatePositionDocument);

  const handleUpdated = useCallback((updated: UpdatePositionMutation["updatePosition"]) => {
    setPositionsList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const [deletePosition, { loading: deleting }] = useMutation(DeletePositionDocument);

  const handleDeleted = useCallback((positionId: string) => {
    setPositionsList((prev) => prev.filter((p) => p.id !== positionId));
  }, []);

  const columns = useMemo(
    () =>
      createPositionsColumns(tColumns, tButtons, isAdmin, {
        onOpen: handleOpen,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      }),
    [isAdmin, handleOpen, handleUpdate, handleDelete, tColumns, tButtons],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: positionsList,
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
    loading: loading && positionsList.length === 0,
    table,
    columnCount,
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
    positionsList,
    updating,
    deleting,
    createPosition,
    updatePosition,
    deletePosition,
  };
}
