"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/lib/auth/permissions";
import { RowActions } from "@/components/shared/row-actions";
import { SortableHeader } from "@/components/shared/sortable-header";
import type { UserItem } from "./types";

interface UsersActions {
  onOpen: (user: UserItem) => void;
  onUpdate: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
}

function ActionsCell({
  user,
  actions,
  tb,
}: {
  user: UserItem;
  actions: UsersActions;
  tb: (key: string) => string;
}) {
  const { currentUserId, isAdmin } = usePermissions();
  const isOwnRow = currentUserId != null && user.id === currentUserId;
  const canEditRow = isAdmin || isOwnRow;
  const canDeleteUser = isAdmin && !user.is_verified;

  return (
    <RowActions canMutate={canEditRow} onOpen={() => actions.onOpen(user)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-[20px] cursor-pointer">
              <MoreVertical className="size-6" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-32">
          <DropdownMenuItem
            onClick={() => actions.onOpen(user)}
            className="justify-center cursor-pointer"
          >
            {tb("open")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onUpdate(user)}
            className="justify-center cursor-pointer"
          >
            {tb("update")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onDelete(user)}
            disabled={!canDeleteUser}
            variant="destructive"
            className="justify-center cursor-pointer"
          >
            {tb("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </RowActions>
  );
}

export function createUsersColumns(
  t: (key: string) => string,
  tb: (key: string) => string,
  actions: UsersActions,
): ColumnDef<UserItem, unknown>[] {
  return [
    {
      id: "id",
      accessorKey: "id",
      enableSorting: true,
      enableGlobalFilter: false,
      enableHiding: true,
      header: () => null,
      cell: () => null,
    },
    {
      id: "avatar",
      header: () => null,
      enableSorting: false,
      enableGlobalFilter: false,
      meta: { className: "w-14" },
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Avatar className="size-10">
            <AvatarImage src={user.profile?.avatar ?? undefined} />
            <AvatarFallback>
              {user.profile?.full_name?.[0].toUpperCase() || user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
      },
      accessorFn: (row) => row.profile?.avatar,
    },
    {
      id: "first_name",
      header: ({ column }) => <SortableHeader column={column} label={t("firstName")} />,
      cell: ({ row }) => row.original.profile?.first_name || "",
      accessorFn: (row) => row.profile?.first_name,
      enableSorting: true,
    },
    {
      id: "last_name",
      header: ({ column }) => <SortableHeader column={column} label={t("lastName")} />,
      cell: ({ row }) => row.original.profile?.last_name || "",
      accessorFn: (row) => row.profile?.last_name,
      enableSorting: true,
      meta: { className: "max-[1439px]:hidden" },
    },
    {
      id: "email",
      header: ({ column }) => <SortableHeader column={column} label={t("email")} />,
      accessorKey: "email",
      enableSorting: true,
      meta: { className: "max-[1439px]:hidden" },
    },
    {
      id: "department_name",
      header: ({ column }) => <SortableHeader column={column} label={t("department")} />,
      cell: ({ row }) => row.original.department_name || "",
      accessorKey: "department_name",
      enableSorting: true,
      meta: { className: "max-md:hidden" },
    },
    {
      id: "position_name",
      header: ({ column }) => <SortableHeader column={column} label={t("position")} />,
      cell: ({ row }) => row.original.position_name || "",
      accessorKey: "position_name",
      enableSorting: true,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("actions")}</span>,
      enableSorting: false,
      enableGlobalFilter: false,
      meta: { className: "w-12" },
      cell: ({ row }) => {
        return <ActionsCell user={row.original} actions={actions} tb={tb} />;
      },
      accessorFn: () => null,
    },
  ];
}
