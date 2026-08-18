"use client";

import type { Table } from "@tanstack/react-table";

interface TableColGroupProps<T> {
  table: Table<T>;
}

export function TableColGroup<T>({ table }: TableColGroupProps<T>) {
  return (
    <colgroup>
      {table.getVisibleLeafColumns().map((column) => (
        <col
          key={column.id}
          className={(column.columnDef.meta as { className?: string } | undefined)?.className ?? ""}
        />
      ))}
    </colgroup>
  );
}
