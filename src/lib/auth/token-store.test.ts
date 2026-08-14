import {
  setAccessToken,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpired,
  resolveBootstrap,
  onBootstrapComplete,
} from "./token-store";

function makeToken(expSeconds: number): string {
  const payload = btoa(JSON.stringify({ exp: expSeconds }));
  return `header.${payload}.signature`;
}

beforeEach(() => {
  clearTokens();
});

describe("token store", () => {
  it("returns null before any token is set", () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("setAccessToken stores the access token", () => {
    setAccessToken("at");
    expect(getAccessToken()).toBe("at");
  });

  it("setTokens stores both tokens", () => {
    setTokens("at", "rt");
    expect(getAccessToken()).toBe("at");
    expect(getRefreshToken()).toBe("rt");
  });

  it("clearTokens resets both tokens", () => {
    setTokens("at", "rt");
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("returns false for a token expiring in the future", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isTokenExpired(makeToken(future))).toBe(false);
  });

  it("returns true for a token that already expired", () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    expect(isTokenExpired(makeToken(past))).toBe(true);
  });

  it("returns true for a malformed token", () => {
    expect(isTokenExpired("not-a-jwt")).toBe(true);
  });

  it("returns true when the payload has no exp", () => {
    const payload = btoa(JSON.stringify({ sub: "u1" }));
    expect(isTokenExpired(`h.${payload}.s`)).toBe(true);
  });
});

describe("bootstrap promise", () => {
  it("resolves when resolveBootstrap is called", async () => {
    let settled = false;
    onBootstrapComplete.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    resolveBootstrap();
    await onBootstrapComplete;
    expect(settled).toBe(true);
  });
});
