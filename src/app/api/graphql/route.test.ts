import { POST } from "./route";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body: JSON.stringify(body),
      json: () => Promise.resolve(body),
    }),
  },
}));
jest.mock("next/headers", () => ({
  cookies: () => ({
    get: () => ({ value: "at" }),
  }),
}));

const ORIGINAL_URL = process.env.GRAPHQL_API_URL;

beforeAll(() => {
  process.env.GRAPHQL_API_URL = "https://api.example.com/graphql";
});

afterAll(() => {
  process.env.GRAPHQL_API_URL = ORIGINAL_URL;
});

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn().mockResolvedValue({
    status: 200,
    json: async () => ({ data: { ok: true } }),
  });
});

describe("graphql route", () => {
  it("proxies the request and returns the response", async () => {
    const res = await POST({
      text: async () => JSON.stringify({ query: "{ __typename }" }),
      nextUrl: { origin: "http://localhost" },
      headers: { get: () => null },
    } as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: { ok: true } });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/graphql",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer at",
        }),
      }),
    );
  });
});
