"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  LanguagesDocument,
  CreateLanguageDocument,
  UpdateLanguageDocument,
  DeleteLanguageDocument,
  type CreateLanguageMutation,
  type UpdateLanguageMutation,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
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
import { useTranslations } from "next-intl";

export function useLanguagesPage(initialLanguages: LanguageItem[]) {
  const { isAdmin } = usePermissions();
  const tColumns = useTranslations("columns.languages");
  const tButtons = useTranslations("buttons");

  const { data: languagesData, loading } = useQuery(LanguagesDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const [languagesList, setLanguagesList] = useState<LanguageItem[]>(initialLanguages);

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (languagesData?.languages && !hydratedRef.current) {
      hydratedRef.current = true;
      setLanguagesList(
        languagesData.languages
          .filter((l): l is NonNullable<typeof l> => l !== null)
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    }
  }, [languagesData]);

  const [deleteTarget, setDeleteTarget] = useState<LanguageItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<LanguageItem | null>(null);
  const [openTarget, setOpenTarget] = useState<LanguageItem | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleOpen = useCallback((language: LanguageItem) => {
    setOpenTarget(language);
  }, []);

  const handleUpdate = useCallback((language: LanguageItem) => {
    setUpdateTarget(language);
  }, []);

  const handleDelete = useCallback((language: LanguageItem) => {
    setDeleteTarget(language);
  }, []);

  const [createLanguage] = useMutation(CreateLanguageDocument);

  const handleCreated = useCallback((newLanguage: CreateLanguageMutation["createLanguage"]) => {
    setLanguagesList((prev) => [...prev, newLanguage]);
  }, []);

  const [updateLanguage, { loading: updating }] = useMutation(UpdateLanguageDocument);

  const handleUpdated = useCallback((updated: UpdateLanguageMutation["updateLanguage"]) => {
    setLanguagesList((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }, []);

  const [deleteLanguage, { loading: deleting }] = useMutation(DeleteLanguageDocument);

  const handleDeleted = useCallback((languageId: string) => {
    setLanguagesList((prev) => prev.filter((l) => l.id !== languageId));
  }, []);

  const columns = useMemo(
    () =>
      createLanguagesColumns(tColumns, tButtons, isAdmin, {
        onOpen: handleOpen,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      }),
    [isAdmin, handleOpen, handleUpdate, handleDelete, tColumns, tButtons],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: languagesList,
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
    loading: loading && languagesList.length === 0,
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
    languagesList,
    updating,
    deleting,
    createLanguage,
    updateLanguage,
    deleteLanguage,
  };
}
