/**
 * Shared Jest mock factories used across the list/CRUD page tests so the mock
 * definitions live in one place. Each factory returns the object passed to the
 * `jest.mock(...)` factory.
 */

import type { ReactNode } from "react";

export const mockNextIntl = () => ({
  useTranslations: () => (key: string) => key.split(".").pop() ?? key,
});

export const mockLucide = () =>
  new Proxy(
    {},
    {
      get: () => () => null,
    },
  );

export const mockRowActions = (
  { fallbackLabel }: { fallbackLabel: string } = { fallbackLabel: "Open" },
) => ({
  RowActions: ({
    canMutate,
    onOpen,
    children,
  }: {
    canMutate: boolean;
    onOpen: () => void;
    children?: ReactNode;
  }) => (canMutate ? <>{children}</> : <button aria-label={fallbackLabel} onClick={onOpen} />),
});

export const mockSortableHeader = () => ({
  SortableHeader: ({ label }: { label: string }) => <span>{label}</span>,
});

export const mockTablePagination = () => ({ TablePagination: () => null });

export const mockPill = () => ({
  Pill: ({ text }: { text: string }) => <span>{text}</span>,
});
