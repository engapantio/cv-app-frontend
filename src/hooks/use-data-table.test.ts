import { renderHook } from "@testing-library/react";
import { useDataTable } from "./use-data-table";
import { useQuery } from "@apollo/client/react";
import type { DocumentNode } from "@apollo/client";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn() }));

const mockUseQuery = useQuery as unknown as jest.Mock;
const query = {} as DocumentNode;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseQuery.mockReturnValue({
    data: undefined,
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
});

describe("useDataTable", () => {
  it("skips the query when there is no server error", () => {
    renderHook(() =>
      useDataTable({ query, getData: (d: { rows: string[] }) => d.rows, serverError: null }),
    );
    expect(mockUseQuery).toHaveBeenCalledWith(
      query,
      expect.objectContaining({ skip: true, errorPolicy: "all" }),
    );
  });

  it("fetches when a server error is present", () => {
    renderHook(() =>
      useDataTable({ query, getData: (d: { rows: string[] }) => d.rows, serverError: "boom" }),
    );
    expect(mockUseQuery).toHaveBeenCalledWith(query, expect.objectContaining({ skip: false }));
  });

  it("uses the initial data while the query is skipped", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() =>
      useDataTable({
        query,
        getData: (d: { rows: string[] }) => d.rows,
        initialData: ["a"],
        serverError: null,
      }),
    );
    expect(result.current.data).toEqual(["a"]);
    expect(result.current.isLoading).toBe(true);
  });

  it("uses the live data once the query returns", () => {
    mockUseQuery.mockReturnValue({
      data: { rows: ["x", "y"] },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() =>
      useDataTable({ query, getData: (d: { rows: string[] }) => d.rows }),
    );
    expect(result.current.data).toEqual(["x", "y"]);
    expect(result.current.error).toBeNull();
  });

  it("always fetches when alwaysFetch is true", () => {
    renderHook(() =>
      useDataTable({ query, getData: (d: { rows: string[] }) => d.rows, alwaysFetch: true }),
    );
    expect(mockUseQuery).toHaveBeenCalledWith(query, expect.objectContaining({ skip: false }));
  });

  it("forwards variables and the fetch policy", () => {
    renderHook(() =>
      useDataTable({
        query,
        variables: { id: "1" },
        getData: (d: { rows: string[] }) => d.rows,
        fetchPolicy: "cache-and-network",
      }),
    );
    expect(mockUseQuery).toHaveBeenCalledWith(
      query,
      expect.objectContaining({ variables: { id: "1" }, fetchPolicy: "cache-and-network" }),
    );
  });
});
