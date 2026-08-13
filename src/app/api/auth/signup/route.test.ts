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

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateClient.mockReturnValue({
    mutate: jest.fn().mockResolvedValue({
      data: {
        signup: {
          user: { id: "u1", email: "a@b.com", role: "User" },
          access_token: "at",
          refresh_token: "rt",
        },
      },
    }),
  });
  mockSetAuthCookies.mockImplementation((response: unknown) => response);
});

describe("signup route", () => {
  it("returns 200 and sets cookies on success", async () => {
    const res = await POST(makeRequest({ email: "a@b.com", password: "secret" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(mockSetAuthCookies).toHaveBeenCalled();
  });

  it("returns 400 when email/password are missing", async () => {
    const res = await POST({
      json: async () => ({}),
      nextUrl: { origin: "http://localhost" },
      headers: { get: () => null },
    } as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Email and password are required");
  });

  it("returns 400 when signup fails", async () => {
    mockCreateClient.mockReturnValue({
      mutate: jest.fn().mockResolvedValue({ data: { signup: null } }),
    });
    const res = await POST(makeRequest({ email: "a@b.com", password: "secret" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Signup failed");
  });
});
