import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Table } from "@tanstack/react-table";
import { TablePagination } from "./table-pagination";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());

function makeTable(
  overrides: {
    pageIndex?: number;
    pageCount?: number;
    canPrevious?: boolean;
    canNext?: boolean;
  } = {},
): Table<unknown> {
  const {
    pageIndex = 0,
    pageCount = 5,
    canPrevious = pageIndex > 0,
    canNext = pageIndex < pageCount - 1,
  } = overrides;
  return {
    getState: () => ({ pagination: { pageIndex } }),
    getPageCount: () => pageCount,
    getCanPreviousPage: () => canPrevious,
    getCanNextPage: () => canNext,
    previousPage: jest.fn(),
    nextPage: jest.fn(),
    setPageIndex: jest.fn(),
  } as unknown as Table<unknown>;
}

describe("TablePagination", () => {
  it("renders previous, page numbers, and next controls", () => {
    render(<TablePagination table={makeTable({ pageIndex: 2, pageCount: 5 })} />);
    expect(screen.getByRole("button", { name: "previous" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "next" })).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("marks the current page as active", () => {
    render(<TablePagination table={makeTable({ pageIndex: 2, pageCount: 5 })} />);
    const links = screen.getAllByRole("button");
    const active = links.find((link) => link.getAttribute("aria-current") === "page");
    expect(active?.textContent).toBe("3");
  });

  it("navigates to the previous page", async () => {
    const user = userEvent.setup();
    const table = makeTable({ pageIndex: 2, pageCount: 5 });
    render(<TablePagination table={table} />);
    await user.click(screen.getByRole("button", { name: "previous" }));
    expect(table.previousPage).toHaveBeenCalled();
  });

  it("navigates to the next page", async () => {
    const user = userEvent.setup();
    const table = makeTable({ pageIndex: 2, pageCount: 5 });
    render(<TablePagination table={table} />);
    await user.click(screen.getByRole("button", { name: "next" }));
    expect(table.nextPage).toHaveBeenCalled();
  });

  it("jumps to a page when a page number is clicked", async () => {
    const user = userEvent.setup();
    const table = makeTable({ pageIndex: 0, pageCount: 5 });
    render(<TablePagination table={table} />);
    await user.click(screen.getByText("5"));
    expect(table.setPageIndex).toHaveBeenCalledWith(4);
  });

  it("renders an ellipsis when pages are skipped", () => {
    const { container } = render(
      <TablePagination table={makeTable({ pageIndex: 2, pageCount: 10 })} />,
    );
    expect(container.querySelector('[data-slot="pagination-ellipsis"]')).toBeInTheDocument();
  });

  it("disables previous on the first page", () => {
    render(<TablePagination table={makeTable({ pageIndex: 0, pageCount: 5 })} />);
    expect(screen.getByRole("button", { name: "previous" }).getAttribute("aria-disabled")).toBe(
      "true",
    );
  });
});
