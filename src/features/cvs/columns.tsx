"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui";
import type { UserQuery } from "@/gql/generated/graphql";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

interface CvActions {
  onOpen: (cvId: string) => void;
  onDelete: (cv: CvItem) => void;
}

export function createCvsColumns(
  currentUserId: string | undefined,
  isAdmin: boolean,
  userEmail: string | null | undefined,
  targetUserId: string,
  actions: CvActions,
): ColumnDef<CvItem>[] {
  return [
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
      id: "education",
      header: ({ column }) => (
        <button
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1 cursor-pointer font-medium"
        >
          Education
          {column.getIsSorted() === "asc" && <ArrowUp className="size-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-4" />}
        </button>
      ),
      accessorFn: (row) => row.education ?? "",
      enableGlobalFilter: true,
    },
    {
      id: "employee",
      header: ({ column }) => (
        <button
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1 cursor-pointer font-medium"
        >
          Employee
          {column.getIsSorted() === "asc" && <ArrowUp className="size-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-4" />}
        </button>
      ),
      accessorFn: () => userEmail ?? "",
      enableGlobalFilter: true,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const cv = row.original;
        const isOwn = currentUserId === targetUserId;
        const canMutate = isOwn || isAdmin;

        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-[20px]">
                    <MoreVertical className="size-6" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-32">
                <DropdownMenuItem onClick={() => actions.onOpen(cv.id)} className="justify-center">
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onOpen(cv.id)}
                  disabled={!canMutate}
                  className="justify-center"
                >
                  Update
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => actions.onDelete(cv)}
                  disabled={!canMutate}
                  variant="destructive"
                  className="justify-center"
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
