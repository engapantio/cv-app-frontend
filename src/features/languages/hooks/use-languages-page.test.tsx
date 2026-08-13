import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useLanguagesPage } from "./use-languages-page";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn(), useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/lib/auth/permissions", () => ({
  usePermissions: () => ({ isAdmin: true, user: { id: "admin-1", role: "Admin" } }),
}));

jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/dropdown-menu", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared/row-actions", () => require("@/test-utils/mocks").mockRowActions());
jest.mock("@/components/shared/sortable-header", () =>
  require("@/test-utils/mocks").mockSortableHeader(),
);

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseMutation = useMutation as unknown as jest.Mock;

const languages = [
  {
    id: "1",
    created_at: "2024-01-01T00:00:00Z",
    iso2: "en",
    name: "English",
    native_name: "English",
  },
  {
    id: "2",
    created_at: "2024-01-01T00:00:00Z",
    iso2: "de",
    name: "German",
    native_name: "Deutsch",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
  mockUseQuery.mockReturnValue({ data: { languages }, loading: false });
});

describe("useLanguagesPage", () => {
  it("filters out null entries from the query result", async () => {
    mockUseQuery.mockReturnValue({
      data: { languages: [languages[0], null, languages[1]] },
      loading: false,
    });
    const { result } = renderHook(() => useLanguagesPage([]));
    await waitFor(() => expect(result.current.languagesList).toHaveLength(2));
    expect(result.current.languagesList.map((l) => l.id)).toEqual(["1", "2"]);
  });

  it("falls back to initial languages when the query returns no data", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: false });
    const { result } = renderHook(() =>
      useLanguagesPage([
        { id: "9", created_at: "", iso2: "fr", name: "French", native_name: "Français" },
      ]),
    );
    expect(result.current.languagesList.map((l) => l.id)).toEqual(["9"]);
  });

  it("filters rows by language name via the global filter", async () => {
    const { result } = renderHook(() => useLanguagesPage([]));
    await waitFor(() => expect(result.current.languagesList).toHaveLength(2));
    act(() => result.current.setGlobalFilter("germ"));
    expect(result.current.table.getRowModel().rows.map((r) => r.original.name)).toEqual(["German"]);
  });

  it("hydrates the list sorted by name to match the SSR render", async () => {
    mockUseQuery.mockReturnValue({
      data: { languages: [languages[1], languages[0]] },
      loading: false,
    });
    const { result } = renderHook(() => useLanguagesPage([]));
    await waitFor(() => expect(result.current.languagesList).toHaveLength(2));
    expect(result.current.languagesList.map((l) => l.name)).toEqual(["English", "German"]);
  });

  it("sorts rows by name in both directions", async () => {
    const { result } = renderHook(() => useLanguagesPage([]));
    await waitFor(() => expect(result.current.languagesList).toHaveLength(2));
    act(() => result.current.table.setSorting([{ id: "name", desc: false }]));
    expect(result.current.table.getRowModel().rows.map((r) => r.original.name)).toEqual([
      "English",
      "German",
    ]);
    act(() => result.current.table.setSorting([{ id: "name", desc: true }]));
    expect(result.current.table.getRowModel().rows.map((r) => r.original.name)).toEqual([
      "German",
      "English",
    ]);
  });

  it("appends a language on create", async () => {
    const { result } = renderHook(() => useLanguagesPage([]));
    await waitFor(() => expect(result.current.languagesList).toHaveLength(2));
    act(() =>
      result.current.handleCreated({
        id: "3",
        created_at: "2024-01-01T00:00:00Z",
        iso2: "fr",
        name: "French",
        native_name: "Français",
      }),
    );
    expect(result.current.languagesList.map((l) => l.id)).toEqual(["1", "2", "3"]);
  });

  it("replaces a language on update", async () => {
    const { result } = renderHook(() => useLanguagesPage([]));
    await waitFor(() => expect(result.current.languagesList).toHaveLength(2));
    act(() =>
      result.current.handleUpdated({
        id: "1",
        created_at: "2024-01-01T00:00:00Z",
        iso2: "en",
        name: "British English",
        native_name: null,
      }),
    );
    expect(result.current.languagesList.find((l) => l.id === "1")?.name).toBe("British English");
  });

  it("removes a language on delete", async () => {
    const { result } = renderHook(() => useLanguagesPage([]));
    await waitFor(() => expect(result.current.languagesList).toHaveLength(2));
    act(() => result.current.handleDeleted("1"));
    expect(result.current.languagesList.map((l) => l.id)).toEqual(["2"]);
  });
});
