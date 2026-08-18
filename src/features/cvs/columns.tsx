"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RowActions } from "@/components/shared/row-actions";
import { SortableHeader } from "@/components/shared/sortable-header";
import { usePermissions } from "@/lib/auth/permissions";
import type { UserQuery } from "@/gql/generated/graphql";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

interface CvActions {
  onOpen: (cvId: string) => void;
  onDelete: (cv: CvItem) => void;
}

function ActionsCell({
  cv,
  tb,
  actions,
  pageOwnerId,
}: {
  cv: CvItem;
  tb: (key: string) => string;
  actions: CvActions;
  pageOwnerId?: string | null;
}) {
  const { currentUserId, isAdmin } = usePermissions();
  const isOwn =
    currentUserId === cv.user?.id || (pageOwnerId != null && currentUserId === pageOwnerId);
  const canMutate = isOwn || isAdmin;

  return (
    <RowActions canMutate={canMutate} onOpen={() => actions.onOpen(cv.id)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-[20px] cursor-pointer">
              <MoreVertical className="size-6 text-muted-solid dark:text-foreground" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-32">
          <DropdownMenuItem
            onClick={() => actions.onOpen(cv.id)}
            className="justify-center cursor-pointer"
          >
            {tb("open")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onOpen(cv.id)}
            disabled={!canMutate}
            className="justify-center cursor-pointer"
          >
            {tb("update")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onDelete(cv)}
            disabled={!canMutate}
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

export function createCvsColumns(
  t: (key: string) => string,
  tb: (key: string) => string,
  actions: CvActions,
  userEmail?: string | null,
  pageOwnerId?: string | null,
): ColumnDef<CvItem>[] {
  return [
    {
      id: "name",
      header: ({ column }) => <SortableHeader column={column} label={t("name")} />,
      accessorKey: "name",
      enableGlobalFilter: true,
    },
    {
      id: "education",
      header: ({ column }) => <SortableHeader column={column} label={t("education")} />,
      accessorFn: (row) => row.education ?? "",
      enableGlobalFilter: true,
      meta: { className: "max-md:hidden max-md:w-0" },
    },
    {
      id: "employee",
      header: ({ column }) => <SortableHeader column={column} label={t("employee")} />,
      accessorFn: (row) => row.user?.email ?? userEmail ?? "",
      enableGlobalFilter: true,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableGlobalFilter: false,
      meta: { className: "w-12" },
      cell: ({ row }) => (
        <ActionsCell cv={row.original} tb={tb} actions={actions} pageOwnerId={pageOwnerId} />
      ),
    },
  ];
}
