"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UsersDocument,
  CreateUserDocument,
  UpdateProfileDocument,
  UpdateUserDocument,
  DeleteUserDocument,
  SendVerificationEmailDocument,
  type UsersQuery,
  type UserRole,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { buildUserUpdateOperations } from "@/lib/user-updates";
import { DuplicateEmailError, isDuplicateEmailError } from "@/features/users/errors";
import { createUsersColumns } from "@/features/users/columns";
import { orderUsers } from "@/features/users/order-users";
import { useDepartmentsList } from "@/lib/apollo/use-departments-list";
import { usePositionsList } from "@/lib/apollo/use-positions-list";
import { useTranslations } from "next-intl";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import type { UserItem } from "@/features/users/types";

export interface CreateUserPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  departmentId: string | null;
  positionId: string | null;
  role: UserRole;
}

export interface UpdateUserPayload {
  userId: string;
  first_name: string;
  last_name: string;
  departmentId: string | null;
  positionId: string | null;
  role: UserRole;
}

export function useUsersPage(
  initialUsers: UserItem[],
  initialUserId: string | null = null,
  initialIsAdmin: boolean = false,
) {
  const router = useRouter();
  const t = useTranslations();
  const tColumns = useTranslations("columns.users");
  const tButtons = useTranslations("buttons");
  const { isAdmin: sessionIsAdmin, currentUserId: sessionUserId } = usePermissions();

  const effectiveUserId = sessionUserId ?? initialUserId ?? null;
  const effectiveIsAdmin = sessionUserId != null ? sessionIsAdmin : initialIsAdmin;

  const { data: usersData, loading } = useQuery<UsersQuery>(UsersDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const { data: departmentsData } = useDepartmentsList();

  const { data: positionsData } = usePositionsList();

  const [usersList, setUsersList] = useState<UserItem[]>(initialUsers);

  useEffect(() => {
    if (usersData?.users) {
      setUsersList(usersData.users as UserItem[]);
    }
  }, [usersData]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleNavigate = useCallback(
    (user: UserItem) => {
      router.push(`/users/${user.id}/profile`);
    },
    [router],
  );

  const handleUpdate = useCallback((user: UserItem) => {
    setUpdateTarget(user);
  }, []);

  const handleDelete = useCallback((user: UserItem) => {
    setDeleteTarget(user);
  }, []);

  const [createUser, { loading: creating }] = useMutation(CreateUserDocument);
  const [updateProfile] = useMutation(UpdateProfileDocument);
  const [updateUser] = useMutation(UpdateUserDocument);
  const [deleteUser, { loading: deleting }] = useMutation(DeleteUserDocument);
  const [sendVerificationEmail] = useMutation(SendVerificationEmailDocument);

  const dispatchVerificationEmail = useCallback(
    async (email: string) => {
      try {
        await sendVerificationEmail({ variables: { email } });
      } catch {
        toast.warning(t("common.userCreatedEmailFailed"));
      }
    },
    [sendVerificationEmail, t],
  );

  const departments = useMemo(() => departmentsData?.departments ?? [], [departmentsData]);
  const positions = useMemo(() => positionsData?.positions ?? [], [positionsData]);

  const handleCreated = useCallback(
    async (payload: CreateUserPayload) => {
      let createdId: string | null = null;
      let createdEmail: string | null = null;
      let createdRole: UserRole | null = null;
      let createdAt: string | null = null;
      try {
        const { data } = await createUser({
          variables: {
            user: {
              auth: { email: payload.email, password: payload.password },
              profile: { first_name: payload.first_name, last_name: payload.last_name },
              cvsIds: [],
              departmentId: payload.departmentId,
              positionId: payload.positionId,
              role: payload.role,
            },
          },
        });
        const created = data?.createUser;
        if (created) {
          createdId = created.id;
          createdEmail = created.email;
          createdRole = created.role;
          createdAt = created.created_at;
        }
      } catch (error) {
        if (isDuplicateEmailError(error)) {
          throw new DuplicateEmailError();
        }
        throw error;
      }
      setCreateOpen(false);
      toast.success(t("common.userCreatedSuccess"));
      dispatchVerificationEmail(payload.email);

      if (createdId) {
        const dept = departments.find((d) => d.id === payload.departmentId);
        const pos = positions.find((p) => p.id === payload.positionId);
        const newUser: UserItem = {
          id: createdId,
          created_at: createdAt ?? new Date().toISOString(),
          email: createdEmail ?? payload.email,
          is_verified: false,
          role: createdRole ?? payload.role,
          department_name: dept?.name ?? null,
          position_name: pos?.name ?? null,
          profile: {
            id: createdId,
            created_at: createdAt ?? new Date().toISOString(),
            first_name: payload.first_name || null,
            last_name: payload.last_name || null,
            full_name: [payload.first_name, payload.last_name].filter(Boolean).join(" ") || null,
            avatar: null,
          },
          department: dept ? { id: dept.id, created_at: dept.created_at, name: dept.name } : null,
          position: pos ? { id: pos.id, created_at: pos.created_at, name: pos.name } : null,
          cvs: [],
        };
        setUsersList((prev) => [newUser, ...prev]);
        setPagination((p) => ({ ...p, pageIndex: 0 }));
      }
    },
    [createUser, setPagination, dispatchVerificationEmail, t, departments, positions],
  );

  const handleDeleted = useCallback(async (userId: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const handleUpdated = useCallback(
    async (payload: UpdateUserPayload) => {
      if (!updateTarget) return;
      const target = updateTarget;

      const operations = buildUserUpdateOperations(
        {
          userId: payload.userId,
          first_name: payload.first_name,
          last_name: payload.last_name,
          departmentId: payload.departmentId,
          positionId: payload.positionId,
          role: payload.role,
        },
        {
          first_name: target.profile?.first_name ?? "",
          last_name: target.profile?.last_name ?? "",
          departmentId: target.department?.id ?? null,
          positionId: target.position?.id ?? null,
          role: target.role,
        },
        { updateProfile, updateUser },
      );

      if (operations.length === 0) return;

      setUpdating(true);
      try {
        const results: boolean[] = [];
        for (const op of operations) {
          try {
            await op.run();
            results.push(true);
          } catch {
            results.push(false);
          }
        }
        const failed = operations.filter((_, i) => !results[i]);
        const allSucceeded = failed.length === 0;

        if (allSucceeded) {
          toast.success(t("common.userUpdatedSuccess"));
          const dept = departments.find((d) => d.id === payload.departmentId);
          const pos = positions.find((p) => p.id === payload.positionId);
          setUsersList((prev) =>
            prev.map((u) => {
              if (u.id !== payload.userId) return u;
              return {
                ...u,
                role: payload.role ?? u.role,
                department_name: dept?.name ?? u.department_name,
                position_name: pos?.name ?? u.position_name,
                profile: {
                  ...u.profile,
                  first_name: payload.first_name || u.profile?.first_name,
                  last_name: payload.last_name || u.profile?.last_name,
                  full_name:
                    [payload.first_name, payload.last_name].filter(Boolean).join(" ") ||
                    u.profile?.full_name,
                },
                department:
                  payload.departmentId != null
                    ? dept
                      ? { id: dept.id, created_at: dept.created_at, name: dept.name }
                      : null
                    : u.department,
                position:
                  payload.positionId != null
                    ? pos
                      ? { id: pos.id, created_at: pos.created_at, name: pos.name }
                      : null
                    : u.position,
              };
            }),
          );
        } else if (failed.length === operations.length) {
          toast.error(t("common.updateUserFailed"));
          throw new Error("updateUserFailed");
        } else {
          const succeeded = operations.filter((_, i) => results[i]);
          toast.warning(
            t("common.userUpdatePartial", {
              succeeded: succeeded
                .map((op) =>
                  t(
                    `common.${op.kind === "profile" ? "userProfileUpdated" : "userDetailsUpdated"}`,
                  ),
                )
                .join(", "),
              failed: failed
                .map((op) =>
                  t(
                    `common.${
                      op.kind === "profile" ? "userProfileUpdateFailed" : "userDetailsUpdateFailed"
                    }`,
                  ),
                )
                .join(", "),
            }),
          );
          const dept = departments.find((d) => d.id === payload.departmentId);
          const pos = positions.find((p) => p.id === payload.positionId);
          setUsersList((prev) =>
            prev.map((u) => {
              if (u.id !== payload.userId) return u;
              const updated = { ...u };
              if (results[0] && operations[0]?.kind === "profile") {
                updated.profile = {
                  ...updated.profile,
                  first_name: payload.first_name || updated.profile?.first_name,
                  last_name: payload.last_name || updated.profile?.last_name,
                  full_name:
                    [payload.first_name, payload.last_name].filter(Boolean).join(" ") ||
                    updated.profile?.full_name,
                };
              }
              if (operations.some((op, i) => op.kind === "user" && results[i])) {
                updated.role = payload.role ?? updated.role;
                updated.department_name = dept?.name ?? updated.department_name;
                updated.position_name = pos?.name ?? updated.position_name;
                updated.department =
                  payload.departmentId != null
                    ? dept
                      ? { id: dept.id, created_at: dept.created_at, name: dept.name }
                      : null
                    : updated.department;
                updated.position =
                  payload.positionId != null
                    ? pos
                      ? { id: pos.id, created_at: pos.created_at, name: pos.name }
                      : null
                    : updated.position;
              }
              return updated;
            }),
          );
        }
      } finally {
        setUpdating(false);
      }
    },
    [updateTarget, updateProfile, updateUser, departments, positions, t],
  );

  const orderedUsers = useMemo(
    () => orderUsers(usersList, effectiveUserId, effectiveIsAdmin),
    [usersList, effectiveUserId, effectiveIsAdmin],
  );

  const columns = useMemo(
    () =>
      createUsersColumns(tColumns, tButtons, {
        onOpen: handleNavigate,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      }),
    [handleNavigate, handleUpdate, handleDelete, tColumns, tButtons],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<UserItem>({
    data: orderedUsers,
    columns,
    state: { sorting, globalFilter, pagination },
    initialState: { columnVisibility: { id: false } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    globalFilterFn: (row, _columnId, filterValue) => {
      const user = row.original;
      const query = String(filterValue ?? "")
        .trim()
        .toLowerCase();
      if (!query) return true;
      const fullName =
        user.profile?.full_name ??
        `${user.profile?.first_name ?? ""} ${user.profile?.last_name ?? ""}`.trim();
      return fullName.toLowerCase().includes(query);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return {
    loading: loading && orderedUsers.length === 0,
    table,
    columnCount: columns.length,
    createOpen,
    setCreateOpen,
    updateTarget,
    setUpdateTarget,
    deleteTarget,
    setDeleteTarget,
    handleCreated,
    handleUpdated,
    handleUpdate,
    handleDeleted,
    globalFilter,
    setGlobalFilter,
    creating,
    updating,
    deleting,
    deleteUser,
  };
}
