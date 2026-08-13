import { GET } from "./route";

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
  getServerAccessToken: jest.fn(),
  getServerRefreshToken: jest.fn(),
  getServerUserId: jest.fn(),
  setAuthCookies: jest.fn(),
}));

const mockCreateClient = jest.mocked(
  require("@/lib/apollo/server-client").createServerApolloClient,
);
const mockGetAccessToken = jest.mocked(require("@/lib/auth/cookies").getServerAccessToken);
const mockGetRefreshToken = jest.mocked(require("@/lib/auth/cookies").getServerRefreshToken);
const mockGetUserId = jest.mocked(require("@/lib/auth/cookies").getServerUserId);
const mockSetAuthCookies = jest.mocked(require("@/lib/auth/cookies").setAuthCookies);

const user = { id: "u1", email: "a@b.com", role: "User" };

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAccessToken.mockResolvedValue(null);
  mockGetRefreshToken.mockResolvedValue(null);
  mockGetUserId.mockResolvedValue("u1");
  mockCreateClient.mockReturnValue({
    query: jest.fn().mockResolvedValue({ data: { user } }),
    mutate: jest.fn().mockResolvedValue({
      data: { updateToken: { access_token: "at2", refresh_token: "rt2" } },
    }),
  });
  mockSetAuthCookies.mockImplementation((response: unknown) => response);
});

describe("session route", () => {
  it("returns anonymous when there is no user id", async () => {
    mockGetUserId.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ authenticated: false, user: null });
  });

  it("returns the user when an access token is valid", async () => {
    mockGetAccessToken.mockResolvedValue("at");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(true);
    expect(body.user).toEqual(user);
  });

  it("refreshes tokens when the access token is invalid", async () => {
    mockGetAccessToken.mockResolvedValue("at-expired");
    mockCreateClient
      .mockReturnValueOnce({
        query: jest.fn().mockRejectedValue(new Error("expired")),
      })
      .mockReturnValue({
        query: jest.fn().mockResolvedValue({ data: { user } }),
        mutate: jest.fn().mockResolvedValue({
          data: { updateToken: { access_token: "at2", refresh_token: "rt2" } },
        }),
      });
    mockGetRefreshToken.mockResolvedValue("rt");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(true);
    expect(mockSetAuthCookies).toHaveBeenCalled();
  });

  it("returns anonymous when refresh fails", async () => {
    mockGetAccessToken.mockResolvedValue("at-expired");
    mockGetRefreshToken.mockResolvedValue("rt");
    mockCreateClient.mockReturnValue({
      query: jest.fn().mockRejectedValue(new Error("expired")),
      mutate: jest.fn().mockRejectedValue(new Error("refresh failed")),
    });
    const res = await GET();
    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });
});
