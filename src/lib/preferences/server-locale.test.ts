import { getServerLocale } from "./server-locale";
import { LOCALE_COOKIE } from "@/i18n/locales";

const mockCookieGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: () => ({ get: (name: string) => mockCookieGet(name) }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getServerLocale", () => {
  it("returns the locale when the cookie holds a valid code", async () => {
    mockCookieGet.mockReturnValue({ value: "ru" });
    await expect(getServerLocale()).resolves.toBe("ru");
    expect(mockCookieGet).toHaveBeenCalledWith(LOCALE_COOKIE);
  });

  it("falls back to the default locale when the cookie is missing", async () => {
    mockCookieGet.mockReturnValue(undefined);
    await expect(getServerLocale()).resolves.toBe("en");
  });

  it("falls back to the default locale when the value is invalid", async () => {
    mockCookieGet.mockReturnValue({ value: "xx" });
    await expect(getServerLocale()).resolves.toBe("en");
  });
});
