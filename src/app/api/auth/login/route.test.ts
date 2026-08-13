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
jest.mock("@/lib/auth/cookies", () => ({ setAuthCookies: jest.fn() }));

const mockCombinedErrorsIs = jest.fn();
jest.mock("@apollo/client/errors", () => ({
  CombinedGraphQLErrors: { is: (...args: unknown[]) => mockCombinedErrorsIs(...args) },
}));

const mockCreateClient = jest.mocked(
  require("@/lib/apollo/server-client").createServerApolloClient,
);
const mockSetAuthCookies = jest.mocked(require("@/lib/auth/cookies").setAuthCookies);

function makeRequest(body: unknown) {
  return {
    json: async () => body,
    nextUrl: { origin: "http://localhost" },
    headers: { get: () => null },
  } as never;
}

const authResult = {
  user: { id: "u1", email: "a@b.com", role: "User" },
  access_token: "at",
  refresh_token: "rt",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCombinedErrorsIs.mockReturnValue(false);
  mockCreateClient.mockReturnValue({
    query: jest.fn().mockResolvedValue({ data: { login: authResult } }),
  });
  mockSetAuthCookies.mockImplementation((response: unknown) => response);
});

describe("login route", () => {
  it("returns 200 and sets cookies on success", async () => {
    const res = await POST(makeRequest({ email: "a@b.com", password: "secret" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toEqual(authResult.user);
    expect(mockSetAuthCookies).toHaveBeenCalled();
  });

  it("returns 401 when login mutation returns null", async () => {
    mockCreateClient.mockReturnValue({
      query: jest.fn().mockResolvedValue({ data: { login: null } }),
    });
    const res = await POST(makeRequest({ email: "a@b.com", password: "secret" }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe("Login failed");
  });

  it("returns 401 for a GraphQL error", async () => {
    mockCombinedErrorsIs.mockReturnValue(true);
    mockCreateClient.mockReturnValue({
      query: jest.fn().mockRejectedValue(new Error("Invalid credentials")),
    });
    const res = await POST(makeRequest({ email: "a@b.com", password: "secret" }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe("Invalid credentials");
  });

  it("returns 500 for a non-GraphQL error", async () => {
    mockCreateClient.mockReturnValue({
      query: jest.fn().mockRejectedValue("string error"),
    });
    const res = await POST(makeRequest({ email: "a@b.com", password: "secret" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe("Unexpected error");
  });
});
