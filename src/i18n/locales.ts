export const locales = [
  { code: "en", label: "English", short: "EN" },
  { code: "ru", label: "Русский", short: "RU" },
  { code: "pl", label: "Polski", short: "PL" },
  { code: "de", label: "Deutsch", short: "DE" },
] as const;

export type LocaleCode = (typeof locales)[number]["code"];

export const defaultLocale: LocaleCode = "en";

export const LOCALE_COOKIE = "cv_locale";

export function isLocale(value: unknown): value is LocaleCode {
  return typeof value === "string" && locales.some((locale) => locale.code === value);
}
