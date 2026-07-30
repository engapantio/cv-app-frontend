"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  SkillsDocument,
  SkillCategoriesDocument,
  CreateSkillDocument,
  UpdateSkillDocument,
  DeleteSkillDocument,
  type CreateSkillMutation,
  type UpdateSkillMutation,
  type SkillCategoriesQuery,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { createSkillsColumns } from "@/features/skills/columns";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { generatePagination } from "@/lib/utils/pagination";
import type { SkillItem } from "@/features/skills/types";

export function useSkillsPage(initialSkills: SkillItem[]) {
  const { isAdmin } = usePermissions();

  const { data, loading, refetch } = useQuery(SkillsDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const { data: categoriesData } = useQuery(SkillCategoriesDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const [skillsList, setSkillsList] = useState<SkillItem[]>(initialSkills);

  useEffect(() => {
    const fetched = data?.skills;
    if (fetched) {
      setSkillsList(fetched);
    }
  }, [data]);

  const [deleteTarget, setDeleteTarget] = useState<SkillItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<SkillItem | null>(null);
  const [openTarget, setOpenTarget] = useState<SkillItem | null>(null);

  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleOpen = useCallback((skill: SkillItem) => {
    setOpenTarget(skill);
  }, []);

  const handleUpdate = useCallback((skill: SkillItem) => {
    setUpdateTarget(skill);
  }, []);

  const handleDelete = useCallback((skill: SkillItem) => {
    setDeleteTarget(skill);
  }, []);

  const [createSkill] = useMutation(CreateSkillDocument);

  const handleCreated = useCallback(
    (newSkill: CreateSkillMutation["createSkill"]) => {
      const item: SkillItem = {
        ...newSkill,
        category: null,
      } as SkillItem;
      setSkillsList((prev) => [...prev, item]);
      refetch();
    },
    [refetch],
  );

  const [updateSkill, { loading: updating }] = useMutation(UpdateSkillDocument);

  const handleUpdated = useCallback(
    (updated: UpdateSkillMutation["updateSkill"]) => {
      setSkillsList((prev) =>
        prev.map((s) =>
          s.id === updated.id ? ({ ...updated, category: s.category } as SkillItem) : s,
        ),
      );
      refetch();
    },
    [refetch],
  );

  const [deleteSkill, { loading: deleting }] = useMutation(DeleteSkillDocument);

  const handleDeleted = useCallback(
    (skillId: string) => {
      setSkillsList((prev) => prev.filter((s) => s.id !== skillId));
      refetch();
    },
    [refetch],
  );

  const categories: SkillCategoriesQuery["skillCategories"] = useMemo(
    () => categoriesData?.skillCategories ?? [],
    [categoriesData],
  );

  const columns = useMemo(
    () =>
      createSkillsColumns(isAdmin, {
        onOpen: handleOpen,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      }),
    [isAdmin, handleOpen, handleUpdate, handleDelete],
  );

  const table = useReactTable({
    data: skillsList,
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
    columnCount,
    currentPage,
    totalPages,
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
    skillsList,
    updating,
    deleting,
    createSkill,
    updateSkill,
    deleteSkill,
    categories,
  };
}
