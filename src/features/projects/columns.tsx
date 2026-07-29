"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProjectItem } from "./hooks/use-projects-page";

export function createProjectColumns(): ColumnDef<ProjectItem>[] {
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
          Domain
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
          Start Date
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
          End Date
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
