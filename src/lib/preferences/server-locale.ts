import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type LocaleCode } from "@/i18n/locales";

export async function getServerLocale(): Promise<LocaleCode> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}
