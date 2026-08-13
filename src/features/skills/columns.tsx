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
import type { SkillItem } from "./types";

interface SkillActions {
  onOpen: (skill: SkillItem) => void;
  onUpdate: (skill: SkillItem) => void;
  onDelete: (skill: SkillItem) => void;
}

function ActionsCell({
  skill,
  tb,
  actions,
}: {
  skill: SkillItem;
  tb: (key: string) => string;
  actions: SkillActions;
}) {
  const { isAdmin } = usePermissions();

  return (
    <RowActions canMutate={isAdmin} onOpen={() => actions.onOpen(skill)}>
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
            onClick={() => actions.onOpen(skill)}
            className="justify-center cursor-pointer"
          >
            {tb("open")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onUpdate(skill)}
            disabled={!isAdmin}
            className="justify-center cursor-pointer"
          >
            {tb("update")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onDelete(skill)}
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

export function createSkillsColumns(
  t: (key: string) => string,
  tb: (key: string) => string,
  actions: SkillActions,
): ColumnDef<SkillItem>[] {
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
      id: "type",
      header: ({ column }) => <SortableHeader column={column} label={t("type")} />,
      accessorFn: (row) => row.category_parent_name ?? "",
      enableGlobalFilter: true,
      meta: { className: "max-md:hidden" },
    },
    {
      id: "category",
      header: ({ column }) => <SortableHeader column={column} label={t("category")} />,
      accessorFn: (row) => row.category_name ?? "",
      enableGlobalFilter: true,
      meta: { className: "max-md:hidden" },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => <ActionsCell skill={row.original} tb={tb} actions={actions} />,
    },
  ];
}
