"use client";

import { useSyncExternalStore } from "react";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "@/i18n/messages";
import type { LocaleCode } from "@/i18n/locales";
import { subscribe, getLocale } from "@/lib/preferences/locale";

export function IntlProvider({
  initialLocale,
  children,
}: {
  initialLocale: LocaleCode;
  children: React.ReactNode;
}) {
  const locale = useSyncExternalStore(
    subscribe,
    () => getLocale(),
    () => initialLocale,
  );

  return (
    <NextIntlClientProvider locale={locale} timeZone="UTC" messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}
