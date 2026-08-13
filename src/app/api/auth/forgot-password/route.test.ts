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

describe("forgot-password route", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Email is required");
  });

  it("returns ok on a successful mutation", async () => {
    const res = await POST(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it("returns 503 for a send-email failure", async () => {
    mockCombinedErrorsIs.mockReturnValue(true);
    mockCreateClient.mockReturnValue({
      mutate: jest.fn().mockRejectedValue(new Error("Failed to send email: SMTP error")),
    });
    const res = await POST(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(503);
  });

  it("returns 400 for a generic GraphQL error", async () => {
    mockCombinedErrorsIs.mockReturnValue(true);
    mockCreateClient.mockReturnValue({
      mutate: jest.fn().mockRejectedValue(new Error("User not found")),
    });
    const res = await POST(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("User not found");
  });

  it("returns 500 for a non-GraphQL error", async () => {
    mockCreateClient.mockReturnValue({
      mutate: jest.fn().mockRejectedValue(new Error("network")),
    });
    const res = await POST(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(500);
  });
});
