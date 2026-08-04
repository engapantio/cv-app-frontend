"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { CvProjectItem } from "./hooks/use-cv-projects-page";

export function createProjectColumns(t: (key: string) => string): ColumnDef<CvProjectItem>[] {
  return [
    {
      id: "name",
      header: ({ column }) => (
        <button
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1 cursor-pointer font-medium"
        >
          {t("name")}
          {column.getIsSorted() === "asc" && <ArrowUp className="size-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-4" />}
        </button>
      ),
      accessorKey: "name",
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      id: "domain",
      header: ({ column }) => (
        <button
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1 cursor-pointer font-medium"
        >
          {t("domain")}
          {column.getIsSorted() === "asc" && <ArrowUp className="size-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-4" />}
        </button>
      ),
      accessorKey: "domain",
      enableSorting: true,
      meta: { className: "hidden max-md:hidden md:table-cell" },
    },
    {
      id: "start_date",
      header: ({ column }) => (
        <button
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1 cursor-pointer font-medium"
        >
          {t("startDate")}
          {column.getIsSorted() === "asc" && <ArrowUp className="size-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-4" />}
        </button>
      ),
      accessorKey: "start_date",
      enableSorting: true,
      meta: { className: "hidden xl:table-cell" },
    },
    {
      id: "end_date",
      header: ({ column }) => (
        <button
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1 cursor-pointer font-medium"
        >
          {t("endDate")}
          {column.getIsSorted() === "asc" && <ArrowUp className="size-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="size-4" />}
        </button>
      ),
      accessorKey: "end_date",
      enableSorting: true,
      meta: { className: "hidden xl:table-cell" },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableGlobalFilter: false,
      meta: { className: "w-12" },
    },
  ];
}
