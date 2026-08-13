import { POST } from "./route";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body: JSON.stringify(body),
      json: () => Promise.resolve(body),
      cookies: { set: jest.fn() },
    }),
  },
}));
jest.mock("@/lib/apollo/server-client", () => ({ createServerApolloClient: jest.fn() }));
jest.mock("@/lib/auth/cookies", () => ({
  getServerRefreshToken: jest.fn(),
  getServerUserId: jest.fn(),
  setAuthCookies: jest.fn(),
  clearAuthCookies: jest.fn(),
}));

const mockCreateClient = jest.mocked(
  require("@/lib/apollo/server-client").createServerApolloClient,
);
const mockGetRefreshToken = jest.mocked(require("@/lib/auth/cookies").getServerRefreshToken);
const mockGetUserId = jest.mocked(require("@/lib/auth/cookies").getServerUserId);
const mockSetAuthCookies = jest.mocked(require("@/lib/auth/cookies").setAuthCookies);
const mockClearAuthCookies = jest.mocked(require("@/lib/auth/cookies").clearAuthCookies);

beforeEach(() => {
  jest.clearAllMocks();
  mockGetRefreshToken.mockResolvedValue("rt");
  mockGetUserId.mockResolvedValue("u1");
  mockCreateClient.mockReturnValue({
    mutate: jest.fn().mockResolvedValue({
      data: {
        updateToken: { access_token: "at2", refresh_token: "rt2" },
      },
    }),
  });
  mockSetAuthCookies.mockImplementation((response: unknown) => response);
  mockClearAuthCookies.mockImplementation((response: unknown) => response);
});

describe("refresh route", () => {
  it("returns 401 and clears cookies when tokens are missing", async () => {
    mockGetRefreshToken.mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(401);
    expect(mockClearAuthCookies).toHaveBeenCalled();
  });

  it("returns 401 when the mutation fails", async () => {
    mockCreateClient.mockReturnValue({
      mutate: jest.fn().mockResolvedValue({ data: { updateToken: null } }),
    });
    const res = await POST();
    expect(res.status).toBe(401);
    expect(mockClearAuthCookies).toHaveBeenCalled();
  });

  it("returns 200 and sets cookies on success", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.accessToken).toBe("at2");
    expect(mockSetAuthCookies).toHaveBeenCalled();
  });

  it("returns 401 when the request throws", async () => {
    mockCreateClient.mockReturnValue({
      mutate: jest.fn().mockRejectedValue(new Error("network")),
    });
    const res = await POST();
    expect(res.status).toBe(401);
    expect(mockClearAuthCookies).toHaveBeenCalled();
  });
});
