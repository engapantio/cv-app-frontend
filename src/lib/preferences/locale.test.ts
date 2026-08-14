import { renderHook, act } from "@testing-library/react";
import { getLocale, setLocale, subscribe, useLocalePref } from "./locale";
import { LOCALE_COOKIE, defaultLocale } from "@/i18n/locales";

describe("locale preference store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.cookie = `${LOCALE_COOKIE}=;path=/;max-age=0`;
    setLocale(defaultLocale);
  });

  it("exposes the current locale", () => {
    expect(getLocale()).toBe(defaultLocale);
  });

  it("setLocale stores a valid locale and notifies listeners", () => {
    const listener = jest.fn();
    const unsubscribe = subscribe(listener);
    act(() => {
      setLocale("ru");
    });
    expect(getLocale()).toBe("ru");
    expect(listener).toHaveBeenCalled();
    expect(localStorage.getItem("cv_locale")).toBe("ru");
    unsubscribe();
  });

  it("setLocale ignores an invalid locale", () => {
    setLocale("xx" as never);
    expect(getLocale()).toBe(defaultLocale);
  });

  it("loads a stored locale on the client", () => {
    localStorage.setItem("cv_locale", "pl");
    jest.resetModules();
    const fresh = require("./locale");
    expect(fresh.getLocale()).toBe("pl");
  });

  it("useLocalePref returns the current locale", () => {
    const { result } = renderHook(() => useLocalePref());
    expect(result.current).toBe(defaultLocale);
    act(() => {
      setLocale("de");
    });
    expect(result.current).toBe("de");
  });
});
