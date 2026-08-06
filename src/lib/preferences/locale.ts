"use client";

import { useSyncExternalStore } from "react";
import { defaultLocale, isLocale, LOCALE_COOKIE, type LocaleCode } from "@/i18n/locales";

const STORAGE_KEY = "cv_locale";

let currentLocale: LocaleCode = defaultLocale;

function loadStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function getLocale(): LocaleCode {
  return currentLocale;
}

export function setLocale(locale: LocaleCode) {
  if (!isLocale(locale)) return;
  currentLocale = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
  } catch {
    // persist best-effort
  }
  emit();
}

export function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

if (typeof window !== "undefined") {
  currentLocale = loadStoredLocale();
  if (currentLocale !== defaultLocale) {
    try {
      document.cookie = `${LOCALE_COOKIE}=${currentLocale};path=/;max-age=31536000;samesite=lax`;
    } catch {
      // persist best-effort
    }
  }
}

export function useLocalePref(): LocaleCode {
  return useSyncExternalStore(
    subscribe,
    () => getLocale(),
    () => defaultLocale,
  );
}
