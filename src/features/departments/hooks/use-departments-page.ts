"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  DepartmentsDocument,
  CreateDepartmentDocument,
  UpdateDepartmentDocument,
  DeleteDepartmentDocument,
  type CreateDepartmentMutation,
  type UpdateDepartmentMutation,
} from "@/gql/generated/graphql";
import { createDepartmentsColumns } from "@/features/departments/columns";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import type { DepartmentItem } from "@/features/departments/types";
import { useTranslations } from "next-intl";

export function useDepartmentsPage(initialDepartments: DepartmentItem[]) {
  const tColumns = useTranslations("columns.departments");
  const tButtons = useTranslations("buttons");

  const { data: departmentsData, loading } = useQuery(DepartmentsDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [departmentsList, setDepartmentsList] = useState<DepartmentItem[]>(initialDepartments);

  useEffect(() => {
    if (departmentsData?.departments) {
      setDepartmentsList(
        (departmentsData.departments as DepartmentItem[])
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    }
  }, [departmentsData]);

  const [deleteTarget, setDeleteTarget] = useState<DepartmentItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<DepartmentItem | null>(null);
  const [openTarget, setOpenTarget] = useState<DepartmentItem | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleOpen = useCallback((department: DepartmentItem) => {
    setOpenTarget(department);
  }, []);

  const handleUpdate = useCallback((department: DepartmentItem) => {
    setUpdateTarget(department);
  }, []);

  const handleDelete = useCallback((department: DepartmentItem) => {
    setDeleteTarget(department);
  }, []);

  const [createDepartment] = useMutation(CreateDepartmentDocument);

  const handleCreated = useCallback(
    (newDepartment: CreateDepartmentMutation["createDepartment"]) => {
      setDepartmentsList((prev) => [...prev, newDepartment]);
    },
    [],
  );

  const [updateDepartment, { loading: updating }] = useMutation(UpdateDepartmentDocument);

  const handleUpdated = useCallback((updated: UpdateDepartmentMutation["updateDepartment"]) => {
    setDepartmentsList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }, []);

  const [deleteDepartment, { loading: deleting }] = useMutation(DeleteDepartmentDocument);

  const handleDeleted = useCallback((departmentId: string) => {
    setDepartmentsList((prev) => prev.filter((d) => d.id !== departmentId));
  }, []);

  const columns = useMemo(
    () =>
      createDepartmentsColumns(tColumns, tButtons, {
        onOpen: handleOpen,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      }),
    [handleOpen, handleUpdate, handleDelete, tColumns, tButtons],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: departmentsList,
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
    loading: loading && departmentsList.length === 0,
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
    departmentsList,
    updating,
    deleting,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
}
