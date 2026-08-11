"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UsersDocument,
  DepartmentsDocument,
  PositionsDocument,
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

  const {
    data: usersData,
    loading,
    refetch,
  } = useQuery<UsersQuery>(UsersDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const { data: departmentsData } = useQuery(DepartmentsDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const { data: positionsData } = useQuery(PositionsDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

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

  const handleCreated = useCallback(
    async (payload: CreateUserPayload) => {
      try {
        await createUser({
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
      } catch (error) {
        if (isDuplicateEmailError(error)) {
          throw new DuplicateEmailError();
        }
        throw error;
      }
      setCreateOpen(false);
      toast.success(t("common.userCreatedSuccess"));
      dispatchVerificationEmail(payload.email);
      await refetch();
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    [createUser, refetch, setPagination, dispatchVerificationEmail, t],
  );

  const handleDeleted = useCallback(
    async (userId: string) => {
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      await refetch();
    },
    [refetch],
  );

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
        if (failed.length === 0) {
          toast.success(t("common.userUpdatedSuccess"));
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
        }
        await refetch();
      } finally {
        setUpdating(false);
      }
    },
    [updateTarget, updateProfile, updateUser, refetch, t],
  );

  const orderedUsers = useMemo(
    () => orderUsers(usersList, effectiveUserId, effectiveIsAdmin),
    [usersList, effectiveUserId, effectiveIsAdmin],
  );

  const columns = useMemo(
    () =>
      createUsersColumns(tColumns, tButtons, effectiveIsAdmin, effectiveUserId ?? undefined, {
        onOpen: handleNavigate,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      }),
    [
      effectiveIsAdmin,
      effectiveUserId,
      handleNavigate,
      handleUpdate,
      handleDelete,
      tColumns,
      tButtons,
    ],
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

  const departments = departmentsData?.departments ?? [];
  const positions = positionsData?.positions ?? [];

  return {
    loading: loading && orderedUsers.length === 0,
    table,
    columnCount: columns.length,
    isAdmin: effectiveIsAdmin,
    currentUserId: effectiveUserId,
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
    departments,
    positions,
    creating,
    updating,
    deleting,
    deleteUser,
  };
}
