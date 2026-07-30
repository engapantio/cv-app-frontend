"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import type { UserQuery } from "@/gql/generated/graphql";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

interface CvActions {
  onOpen: (cvId: string) => void;
  onDelete: (cv: CvItem) => void;
}

export function createCvsColumns(
  currentUserId: string | undefined,
  isAdmin: boolean,
  actions: CvActions,
  userEmail?: string | null,
): ColumnDef<CvItem>[] {
  return [
    {
      id: "id",
      accessorKey: "id",
      enableSorting: true,
      enableGlobalFilter: false,
      enableHiding: true,
      enableColumnFilter: false,
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
      meta: { className: "max-md:hidden" },
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
      accessorFn: (row) => row.user?.email ?? userEmail ?? "",
      enableGlobalFilter: true,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const cv = row.original;
        const isOwn = currentUserId === cv.user?.id;
        const canMutate = isOwn || isAdmin;

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
                  onClick={() => actions.onOpen(cv.id)}
                  className="justify-center cursor-pointer"
                >
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onOpen(cv.id)}
                  disabled={!canMutate}
                  className="justify-center cursor-pointer"
                >
                  Update
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onDelete(cv)}
                  disabled={!canMutate}
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
