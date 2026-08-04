"use client";

import { NextIntlClientProvider } from "next-intl";
import { messages } from "@/i18n/messages";
import { useLocalePref } from "@/lib/preferences/locale";

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocalePref();

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}
