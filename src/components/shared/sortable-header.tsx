"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";

interface SortableHeaderProps<T> {
  column: Column<T, unknown>;
  label: string;
}

export function SortableHeader<T>({ column, label }: SortableHeaderProps<T>) {
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={column.getToggleSortingHandler()}
      className="flex items-center gap-1 cursor-pointer font-medium"
    >
      {label}
      <span className="flex size-4 items-center justify-center">
        {sorted === "asc" && <ArrowUp className="size-4" />}
        {sorted === "desc" && <ArrowDown className="size-4" />}
      </span>
    </button>
  );
}
