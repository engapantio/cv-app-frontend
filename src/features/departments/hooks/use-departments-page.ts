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
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useDepartmentsPage(initialDepartments: DepartmentItem[]) {
  const t = useTranslations();
  const tColumns = useTranslations("columns.departments");
  const tButtons = useTranslations("buttons");

  const { data: departmentsData, loading } = useQuery(DepartmentsDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [departmentsList, setDepartmentsList] = useState<DepartmentItem[]>(initialDepartments);

  useEffect(() => {
    if (departmentsData?.departments) {
      setDepartmentsList(departmentsData.departments as DepartmentItem[]);
    }
  }, [departmentsData]);

  const [deleteTarget, setDeleteTarget] = useState<DepartmentItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<DepartmentItem | null>(null);
  const [openTarget, setOpenTarget] = useState<DepartmentItem | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
    { id: "id", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

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
    (_newDepartment: CreateDepartmentMutation["createDepartment"]) => {
      toast.success(t("common.departmentCreatedSuccess"));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [t, setPagination],
  );

  const [updateDepartment, { loading: updating }] = useMutation(UpdateDepartmentDocument);

  const handleUpdated = useCallback(
    (updated: UpdateDepartmentMutation["updateDepartment"]) => {
      setDepartmentsList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      toast.success(t("common.departmentUpdatedSuccess"));
    },
    [t],
  );

  const [deleteDepartment, { loading: deleting }] = useMutation(DeleteDepartmentDocument);

  const handleDeleted = useCallback(
    (departmentId: string) => {
      setDepartmentsList((prev) => prev.filter((d) => d.id !== departmentId));
      toast.success(t("common.departmentDeletedSuccess"));
    },
    [t],
  );

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
