import { renderHook } from "@testing-library/react";
import { useSession } from "./session";

jest.mock("@apollo/client", () => ({
  makeVar: (initial: unknown) => {
    let value = initial;
    const reactiveVar = (next?: unknown) => {
      if (next === undefined) return value;
      value = next;
      return next;
    };
    return reactiveVar;
  },
}));
jest.mock("@apollo/client/react", () => ({
  useReactiveVar: (reactiveVar: () => unknown) => reactiveVar(),
}));

const mockSetTokens = jest.fn();
const mockClearTokens = jest.fn();
const mockResolveBootstrap = jest.fn();
const mockGetAccessToken = jest.fn();
const mockIsTokenExpired = jest.fn();
jest.mock("./token-store", () => ({
  setTokens: (...args: unknown[]) => mockSetTokens(...args),
  clearTokens: (...args: unknown[]) => mockClearTokens(...args),
  resolveBootstrap: (...args: unknown[]) => mockResolveBootstrap(...args),
  getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
  isTokenExpired: (...args: unknown[]) => mockIsTokenExpired(...args),
}));

import {
  sessionStateVar,
  setAuthenticatedSession,
  clearSession,
  resetSessionToLoading,
  markUserVerified,
  updateSessionProfile,
  syncSessionProfileFromUpdate,
  logout,
} from "./session";

const user = {
  id: "u1",
  email: "a@b.com",
  role: "User",
  is_verified: false,
  profile: { first_name: "Alice", last_name: "Smith" },
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionStateVar({ status: "loading", user: null });
  mockGetAccessToken.mockReturnValue(null);
  mockIsTokenExpired.mockReturnValue(false);
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ authenticated: false, user: null }),
  });
});

describe("setAuthenticatedSession", () => {
  it("sets the session state to authenticated", () => {
    setAuthenticatedSession(user as never);
    expect(sessionStateVar()).toEqual({ status: "authenticated", user });
  });
});

describe("clearSession", () => {
  it("resets the session and clears tokens", () => {
    setAuthenticatedSession(user as never);
    clearSession();
    expect(sessionStateVar()).toEqual({ status: "anonymous", user: null });
    expect(mockClearTokens).toHaveBeenCalled();
  });
});

describe("resetSessionToLoading", () => {
  it("resets the session to loading state", () => {
    setAuthenticatedSession(user as never);
    resetSessionToLoading();
    expect(sessionStateVar()).toEqual({ status: "loading", user: null });
    expect(mockClearTokens).toHaveBeenCalled();
  });
});

describe("useSession", () => {
  it("returns isAuthenticated for an authenticated session", () => {
    setAuthenticatedSession(user as never);
    const { result } = renderHook(() => useSession());
    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(user);
  });

  it("returns anonymous for a cleared session", () => {
    clearSession();
    const { result } = renderHook(() => useSession());
    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.status).toBe("anonymous");
  });
});

describe("markUserVerified", () => {
  it("sets is_verified on the current user", () => {
    setAuthenticatedSession(user as never);
    markUserVerified();
    expect(sessionStateVar().user?.is_verified).toBe(true);
  });

  it("does nothing when not authenticated", () => {
    markUserVerified();
    expect(sessionStateVar().user).toBeNull();
  });
});

describe("updateSessionProfile", () => {
  it("updates profile fields", () => {
    setAuthenticatedSession(user as never);
    updateSessionProfile({ first_name: "Alice M." });
    expect(sessionStateVar().user?.profile?.first_name).toBe("Alice M.");
  });

  it("does nothing when not authenticated", () => {
    updateSessionProfile({ first_name: "x" });
    expect(sessionStateVar().user).toBeNull();
  });
});

describe("syncSessionProfileFromUpdate", () => {
  it("builds full_name and calls updateSessionProfile", () => {
    setAuthenticatedSession({ ...user, profile: { first_name: "", last_name: "" } } as never);
    syncSessionProfileFromUpdate({
      first_name: "Alice",
      last_name: "Smith",
      department: { id: "d1", name: "IT" },
      position: { id: "p1", name: "Dev" },
    });
    const u = sessionStateVar().user!;
    expect(u.profile?.full_name).toBe("Alice Smith");
    expect(u.department_name).toBe("IT");
    expect(u.position_name).toBe("Dev");
  });
});

describe("logout", () => {
  it("calls the logout endpoint and clears the session", async () => {
    setAuthenticatedSession(user as never);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    await logout();
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    expect(sessionStateVar().status).toBe("anonymous");
  });
});
