"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import {
  LanguagesDocument,
  type CreateLanguageMutation,
  type UpdateLanguageMutation,
} from "@/gql/generated/graphql";
import { createLanguagesColumns } from "@/features/languages/columns";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import type { LanguageItem } from "@/features/languages/types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useLanguagesPage(initialLanguages: LanguageItem[]) {
  const t = useTranslations();
  const tColumns = useTranslations("columns.languages");
  const tButtons = useTranslations("buttons");

  const { data: languagesData, loading } = useQuery(LanguagesDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [languagesList, setLanguagesList] = useState<LanguageItem[]>(initialLanguages);

  useEffect(() => {
    if (languagesData?.languages) {
      setLanguagesList(
        languagesData.languages.filter((l): l is NonNullable<typeof l> => l !== null),
      );
    }
  }, [languagesData]);

  const [deleteTarget, setDeleteTarget] = useState<LanguageItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<LanguageItem | null>(null);
  const [openTarget, setOpenTarget] = useState<LanguageItem | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
    { id: "id", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const handleOpen = useCallback((language: LanguageItem) => {
    setOpenTarget(language);
  }, []);

  const handleUpdate = useCallback((language: LanguageItem) => {
    setUpdateTarget(language);
  }, []);

  const handleDelete = useCallback((language: LanguageItem) => {
    setDeleteTarget(language);
  }, []);

  const handleCreated = useCallback(
    (_newLanguage: CreateLanguageMutation["createLanguage"]) => {
      toast.success(t("common.languageCreatedSuccess"));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [t, setPagination],
  );

  const handleUpdated = useCallback(
    (updated: UpdateLanguageMutation["updateLanguage"]) => {
      setLanguagesList((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      toast.success(t("common.languageUpdatedSuccess"));
    },
    [t],
  );

  const handleDeleted = useCallback(
    (languageId: string) => {
      setLanguagesList((prev) => prev.filter((l) => l.id !== languageId));
      toast.success(t("common.languageDeletedSuccess"));
    },
    [t],
  );

  const columns = useMemo(
    () =>
      createLanguagesColumns(tColumns, tButtons, {
        onOpen: handleOpen,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      }),
    [handleOpen, handleUpdate, handleDelete, tColumns, tButtons],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table requires the table instance to be created directly in the render body
  const table = useReactTable({
    data: languagesList,
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
    loading: loading && languagesList.length === 0,
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
    languagesList,
  };
}
