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
import type { LanguageItem } from "./types";

interface LanguageActions {
  onOpen: (language: LanguageItem) => void;
  onUpdate: (language: LanguageItem) => void;
  onDelete: (language: LanguageItem) => void;
}

function ActionsCell({
  language,
  tb,
  actions,
}: {
  language: LanguageItem;
  tb: (key: string) => string;
  actions: LanguageActions;
}) {
  const { isAdmin } = usePermissions();

  return (
    <RowActions canMutate={isAdmin} onOpen={() => actions.onOpen(language)}>
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
            onClick={() => actions.onOpen(language)}
            className="justify-center cursor-pointer"
          >
            {tb("open")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onUpdate(language)}
            disabled={!isAdmin}
            className="justify-center cursor-pointer"
          >
            {tb("update")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onDelete(language)}
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

export function createLanguagesColumns(
  t: (key: string) => string,
  tb: (key: string) => string,
  actions: LanguageActions,
): ColumnDef<LanguageItem>[] {
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
      id: "created_at",
      accessorKey: "created_at",
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
      id: "native_name",
      header: ({ column }) => <SortableHeader column={column} label={t("nativeName")} />,
      accessorFn: (row) => row.native_name ?? "",
      enableGlobalFilter: false,
      meta: { className: "max-md:hidden" },
    },
    {
      id: "iso2",
      header: ({ column }) => <SortableHeader column={column} label={t("iso2")} />,
      accessorKey: "iso2",
      enableGlobalFilter: false,
      meta: { className: "max-md:hidden" },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableGlobalFilter: false,
      meta: { className: "w-12" },
      cell: ({ row }) => <ActionsCell language={row.original} tb={tb} actions={actions} />,
    },
  ];
}
