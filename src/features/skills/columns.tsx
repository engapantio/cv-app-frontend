"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SkillItem } from "./types";

interface SkillActions {
  onOpen: (skill: SkillItem) => void;
  onUpdate: (skill: SkillItem) => void;
  onDelete: (skill: SkillItem) => void;
}

export function createSkillsColumns(
  isAdmin: boolean,
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
      header: ({ column }) => (
        <button
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1 cursor-pointer font-medium"
        >
          Name
          {column.getIsSorted() === "asc" && <ArrowUp className="size-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-4" />}
        </button>
      ),
      accessorKey: "name",
      enableGlobalFilter: true,
    },
    {
      id: "type",
      header: ({ column }) => (
        <button
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1 cursor-pointer font-medium"
        >
          Type
          {column.getIsSorted() === "asc" && <ArrowUp className="size-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-4" />}
        </button>
      ),
      accessorFn: (row) => row.category_parent_name ?? "",
      enableGlobalFilter: true,
      meta: { className: "max-md:hidden" },
    },
    {
      id: "category",
      header: ({ column }) => (
        <button
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1 cursor-pointer font-medium"
        >
          Category
          {column.getIsSorted() === "asc" && <ArrowUp className="size-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-4" />}
        </button>
      ),
      accessorFn: (row) => row.category_name ?? "",
      enableGlobalFilter: true,
      meta: { className: "max-md:hidden" },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const skill = row.original;
        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
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
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onUpdate(skill)}
                  disabled={!isAdmin}
                  className="justify-center cursor-pointer"
                >
                  Update
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onDelete(skill)}
                  disabled={!isAdmin}
                  variant="destructive"
                  className="justify-center cursor-pointer"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
