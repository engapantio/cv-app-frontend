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
import type { PositionItem } from "./types";

interface PositionActions {
  onOpen: (position: PositionItem) => void;
  onUpdate: (position: PositionItem) => void;
  onDelete: (position: PositionItem) => void;
}

export function createPositionsColumns(
  t: (key: string) => string,
  tb: (key: string) => string,
  isAdmin: boolean,
  actions: PositionActions,
): ColumnDef<PositionItem>[] {
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
      cell: ({ row }) => {
        const position = row.original;
        return (
          <RowActions canMutate={isAdmin} onOpen={() => actions.onOpen(position)}>
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
                  onClick={() => actions.onOpen(position)}
                  className="justify-center cursor-pointer"
                >
                  {tb("open")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onUpdate(position)}
                  disabled={!isAdmin}
                  className="justify-center cursor-pointer"
                >
                  {tb("update")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onDelete(position)}
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
      },
    },
  ];
}
