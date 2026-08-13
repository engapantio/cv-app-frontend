import { renderHook } from "@testing-library/react";
import { usePermissions } from "./permissions";
import { useSession } from "./session";
import { useServerUser } from "./server-user-context";

jest.mock("./session", () => ({ useSession: jest.fn() }));
jest.mock("./server-user-context", () => ({ useServerUser: jest.fn() }));

const mockUseSession = useSession as unknown as jest.Mock;
const mockUseServerUser = useServerUser as unknown as jest.Mock;

const sessionUser = { id: "u1", role: "User" };
const serverUser = { id: "u2", role: "Admin" };

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSession.mockReturnValue({ user: null });
  mockUseServerUser.mockReturnValue(null);
});

describe("usePermissions", () => {
  it("returns defaults when there is no user", () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current).toEqual({
      currentUserId: undefined,
      isAdmin: false,
      isOwner: false,
      canEdit: false,
      user: null,
    });
  });

  it("prefers the session user over the server user", () => {
    mockUseSession.mockReturnValue({ user: sessionUser });
    mockUseServerUser.mockReturnValue(serverUser);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.user).toEqual(sessionUser);
    expect(result.current.currentUserId).toBe("u1");
  });

  it("falls back to the server user when there is no session user", () => {
    mockUseServerUser.mockReturnValue(serverUser);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.user).toEqual(serverUser);
    expect(result.current.isAdmin).toBe(true);
  });

  it("marks the owner when the target matches the current user", () => {
    mockUseSession.mockReturnValue({ user: sessionUser });
    const { result } = renderHook(() => usePermissions("u1"));
    expect(result.current.isOwner).toBe(true);
    expect(result.current.canEdit).toBe(true);
  });

  it("denies edit rights for other non-admin users", () => {
    mockUseSession.mockReturnValue({ user: sessionUser });
    const { result } = renderHook(() => usePermissions("u9"));
    expect(result.current.isOwner).toBe(false);
    expect(result.current.canEdit).toBe(false);
  });

  it("grants edit rights to admins for any target", () => {
    mockUseSession.mockReturnValue({ user: serverUser });
    const { result } = renderHook(() => usePermissions("u9"));
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canEdit).toBe(true);
  });
});
