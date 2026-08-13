import { POST } from "./route";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body: JSON.stringify(body),
      headers: new Map([["content-type", "application/json"]]),
      json: () => Promise.resolve(body),
    }),
  },
}));
jest.mock("@/lib/auth/cookies", () => ({ clearAuthCookies: jest.fn() }));

function getMockClearAuthCookies() {
  return require("@/lib/auth/cookies").clearAuthCookies as jest.Mock;
}

describe("logout route", () => {
  it("clears the auth cookies on the response", async () => {
    getMockClearAuthCookies().mockImplementation((response: Response) => response);
    const res = await POST();
    expect(getMockClearAuthCookies()).toHaveBeenCalled();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });
});
