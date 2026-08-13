import { renderHook } from "@testing-library/react";
import { useCvDetails } from "./use-cv-details";
import { useQuery, useMutation } from "@apollo/client/react";
import { usePermissions } from "@/lib/auth/permissions";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn(), useMutation: jest.fn() }));
jest.mock("@/lib/auth/permissions", () => ({ usePermissions: jest.fn() }));

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseMutation = useMutation as unknown as jest.Mock;
const mockUsePermissions = usePermissions as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseQuery.mockReturnValue({ data: undefined, loading: false });
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
  mockUsePermissions.mockReturnValue({ canEdit: false, isOwner: false, isAdmin: false });
});

describe("useCvDetails", () => {
  it("queries the cv with the given id", () => {
    renderHook(() => useCvDetails("cv1"));
    expect(mockUseQuery).toHaveBeenCalledWith(expect.anything(), {
      variables: { cvId: "cv1" },
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    });
  });

  it("returns null cv while loading", () => {
    const { result } = renderHook(() => useCvDetails("cv1"));
    expect(result.current.cv).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("exposes the loaded cv and permissions", () => {
    const cv = { id: "cv1", user: { id: "u1" } } as never;
    mockUseQuery.mockReturnValue({ data: { cv }, loading: false });
    mockUsePermissions.mockReturnValue({ canEdit: true, isOwner: true, isAdmin: false });
    const { result } = renderHook(() => useCvDetails("cv1"));
    expect(result.current.cv).toEqual(cv);
    expect(result.current.canEdit).toBe(true);
    expect(mockUsePermissions).toHaveBeenCalledWith("u1");
  });

  it("exposes the update mutation state", () => {
    mockUseMutation.mockReturnValue([jest.fn(), { loading: true }]);
    const { result } = renderHook(() => useCvDetails("cv1"));
    expect(result.current.updating).toBe(true);
    expect(typeof result.current.updateCv).toBe("function");
  });
});
