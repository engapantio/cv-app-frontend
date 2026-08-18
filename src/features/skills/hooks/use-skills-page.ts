"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import {
  SkillsDocument,
  type CreateSkillMutation,
  type UpdateSkillMutation,
  type SkillCategoriesQuery,
} from "@/gql/generated/graphql";
import { createSkillsColumns } from "@/features/skills/columns";
import { useSkillCategoriesList } from "@/lib/apollo/use-skill-categories-list";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import type { SkillItem } from "@/features/skills/types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useSkillsPage(
  initialSkills: SkillItem[],
  serverError?: string | null,
  initialCategories: SkillCategoriesQuery["skillCategories"] = [],
) {
  const t = useTranslations();
  const tColumns = useTranslations("columns.skills");
  const tButtons = useTranslations("buttons");

  const { data: skillsData, loading } = useQuery(SkillsDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const { data: categoriesData } = useSkillCategoriesList();

  const [skillsList, setSkillsList] = useState<SkillItem[]>(initialSkills);

  useEffect(() => {
    if (skillsData?.skills) {
      setSkillsList(skillsData.skills as SkillItem[]);
    }
  }, [skillsData]);

  const [deleteTarget, setDeleteTarget] = useState<SkillItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<SkillItem | null>(null);
  const [openTarget, setOpenTarget] = useState<SkillItem | null>(null);

  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const handleOpen = useCallback((skill: SkillItem) => {
    setOpenTarget(skill);
  }, []);

  const handleUpdate = useCallback((skill: SkillItem) => {
    setUpdateTarget(skill);
  }, []);

  const handleDelete = useCallback((skill: SkillItem) => {
    setDeleteTarget(skill);
  }, []);

  const categories: SkillCategoriesQuery["skillCategories"] = useMemo(
    () => categoriesData?.skillCategories ?? initialCategories,
    [categoriesData, initialCategories],
  );

  const handleCreated = useCallback(
    (newSkill: CreateSkillMutation["createSkill"]) => {
      const matched = categories.find((c) => c.name === newSkill.category_name);
      const item: SkillItem = {
        ...newSkill,
        category_parent_name: newSkill.category_parent_name ?? matched?.parent?.name ?? null,
        category: matched ?? null,
      } as SkillItem;
      setSkillsList((prev) => [...prev, item]);
      toast.success(t("common.skillCreatedSuccess"));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [categories, t, setPagination],
  );

  const handleUpdated = useCallback(
    (updated: UpdateSkillMutation["updateSkill"]) => {
      const matched = categories.find((c) => c.name === updated.category_name);
      setSkillsList((prev) =>
        prev.map((s) =>
          s.id === updated.id
            ? ({
                ...updated,
                category_parent_name: updated.category_parent_name ?? matched?.parent?.name ?? null,
                category: matched ?? null,
              } as SkillItem)
            : s,
        ),
      );
      toast.success(t("common.skillUpdatedSuccess"));
    },
    [categories, t],
  );

  const handleDeleted = useCallback(
    (skillId: string) => {
      setSkillsList((prev) => prev.filter((s) => s.id !== skillId));
      toast.success(t("common.skillDeletedSuccess"));
    },
    [t],
  );

  const columns = useMemo(
    () =>
      createSkillsColumns(tColumns, tButtons, {
        onOpen: handleOpen,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      }),
    [handleOpen, handleUpdate, handleDelete, tColumns, tButtons],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: skillsList,
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
    loading: loading && skillsList.length === 0,
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
    skillsList,
  };
}
