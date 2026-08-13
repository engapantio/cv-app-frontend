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

const mockCombinedErrorsIs = jest.fn();
jest.mock("@apollo/client/errors", () => ({
  CombinedGraphQLErrors: { is: (...args: unknown[]) => mockCombinedErrorsIs(...args) },
}));

const mockCreateClient = jest.mocked(
  require("@/lib/apollo/server-client").createServerApolloClient,
);

function makeRequest(body: unknown) {
  return {
    json: async () => body,
    nextUrl: { origin: "http://localhost" },
    headers: { get: () => null },
  } as never;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCombinedErrorsIs.mockReturnValue(false);
  mockCreateClient.mockReturnValue({
    mutate: jest.fn().mockResolvedValue({ data: {} }),
  });
});

describe("reset-password route", () => {
  it("returns 400 when newPassword is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("New password is required");
  });

  it("returns ok on a successful mutation", async () => {
    const res = await POST(makeRequest({ newPassword: "newpass", token: "t" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it("returns 400 for a GraphQL error", async () => {
    mockCombinedErrorsIs.mockReturnValue(true);
    mockCreateClient.mockReturnValue({
      mutate: jest.fn().mockRejectedValue(new Error("Token expired")),
    });
    const res = await POST(makeRequest({ newPassword: "newpass", token: "t" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Token expired");
  });

  it("returns 500 for a non-GraphQL error", async () => {
    mockCreateClient.mockReturnValue({
      mutate: jest.fn().mockRejectedValue(new Error("network")),
    });
    const res = await POST(makeRequest({ newPassword: "newpass", token: "t" }));
    expect(res.status).toBe(500);
  });
});
