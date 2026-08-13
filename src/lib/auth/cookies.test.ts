import {
  setAuthCookies,
  clearAuthCookies,
  getClientAccessToken,
  getClientUserId,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_ID_COOKIE,
} from "./cookies";

function makeResponse() {
  return { cookies: { set: jest.fn() } } as unknown as Parameters<typeof setAuthCookies>[0];
}

describe("setAuthCookies and clearAuthCookies", () => {
  it("setAuthCookies sets three cookies on the response", () => {
    const response = makeResponse();
    setAuthCookies(response, { accessToken: "at", refreshToken: "rt" }, "u1");
    expect(response.cookies.set).toHaveBeenCalledTimes(3);
    expect(response.cookies.set).toHaveBeenCalledWith(
      expect.objectContaining({ name: ACCESS_TOKEN_COOKIE, value: "at" }),
    );
    expect(response.cookies.set).toHaveBeenCalledWith(
      expect.objectContaining({ name: REFRESH_TOKEN_COOKIE, value: "rt" }),
    );
    expect(response.cookies.set).toHaveBeenCalledWith(
      expect.objectContaining({ name: USER_ID_COOKIE, value: "u1" }),
    );
  });

  it("clearAuthCookies expires three cookies", () => {
    const response = makeResponse();
    clearAuthCookies(response);
    expect(response.cookies.set).toHaveBeenCalledTimes(3);
    for (const call of (response.cookies.set as jest.Mock).mock.calls) {
      expect(call[0]).toMatchObject({ value: "", maxAge: 0 });
    }
  });
});

function makeRequest(getter: (name: string) => { value: string } | undefined) {
  return { cookies: { get: getter } } as unknown as Parameters<typeof getClientAccessToken>[0];
}

describe("getClientAccessToken and getClientUserId", () => {
  it("returns the cookie value when present", () => {
    const req = makeRequest(() => ({ value: "tok" }));
    expect(getClientAccessToken(req)).toBe("tok");
  });

  it("returns null when the cookie is missing", () => {
    const req = makeRequest(() => undefined);
    expect(getClientAccessToken(req)).toBeNull();
  });

  it("reads the user id cookie", () => {
    const req = makeRequest((name: string) =>
      name === USER_ID_COOKIE ? { value: "u1" } : undefined,
    );
    expect(getClientUserId(req)).toBe("u1");
  });
});
