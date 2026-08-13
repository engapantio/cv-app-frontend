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
import { usePermissions } from "@/lib/auth/permissions";
import { RowActions } from "@/components/shared/row-actions";
import { SortableHeader } from "@/components/shared/sortable-header";
import type { DepartmentItem } from "./types";

interface DepartmentActions {
  onOpen: (department: DepartmentItem) => void;
  onUpdate: (department: DepartmentItem) => void;
  onDelete: (department: DepartmentItem) => void;
}

function ActionsCell({
  department,
  tb,
  actions,
}: {
  department: DepartmentItem;
  tb: (key: string) => string;
  actions: DepartmentActions;
}) {
  const { isAdmin } = usePermissions();

  return (
    <RowActions canMutate={isAdmin} onOpen={() => actions.onOpen(department)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-[20px] cursor-pointer">
              <MoreVertical className="size-6 text-[#767676] dark:text-white" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-32">
          <DropdownMenuItem
            onClick={() => actions.onOpen(department)}
            className="justify-center cursor-pointer"
          >
            {tb("open")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onUpdate(department)}
            disabled={!isAdmin}
            className="justify-center cursor-pointer"
          >
            {tb("update")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onDelete(department)}
            disabled={!isAdmin}
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

export function createDepartmentsColumns(
  t: (key: string) => string,
  tb: (key: string) => string,
  actions: DepartmentActions,
): ColumnDef<DepartmentItem>[] {
  return [
    {
      id: "id",
      accessorKey: "id",
      enableSorting: true,
      enableGlobalFilter: false,
      enableHiding: false,
      meta: { className: "hidden" },
      header: () => null,
      cell: () => null,
    },
    {
      id: "name",
      header: ({ column }) => <SortableHeader column={column} label={t("name")} />,
      accessorKey: "name",
      enableGlobalFilter: true,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => <ActionsCell department={row.original} tb={tb} actions={actions} />,
    },
  ];
}
