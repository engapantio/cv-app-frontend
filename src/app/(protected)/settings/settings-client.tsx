"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { FloatingField, TablePageLayout } from "@/components/shared";
import { locales, defaultLocale, type LocaleCode } from "@/i18n/locales";
import { useLocalePref, setLocale } from "@/lib/preferences/locale";

type AppearanceValue = "system" | "light" | "dark";

const selectClassName =
  "border-0 w-full bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-sm";

export default function SettingsClient() {
  const t = useTranslations();
  const locale = useLocalePref();
  const { theme, setTheme } = useTheme();

  const appearanceValue: AppearanceValue =
    theme === "dark" ? "dark" : theme === "light" ? "light" : "system";

  const appearanceLabels: Record<AppearanceValue, string> = {
    system: t("DeviceSettings"),
    light: t("Light"),
    dark: t("Dark"),
  };

  return (
    <TablePageLayout title={t("Settings")}>
      <div className="flex justify-center pt-10">
        <div className="grid gap-8 w-full max-w-sm md:max-w-2xl">
          <FloatingField
            label={t("Appearance")}
            variant="select"
            labelClassName="bg-background"
            active
          >
            <Select value={appearanceValue} onValueChange={(value) => setTheme(value ?? "system")}>
              <SelectTrigger className={selectClassName}>
                <SelectValue placeholder={t("DeviceSettings")}>
                  {appearanceLabels[appearanceValue]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">{t("DeviceSettings")}</SelectItem>
                <SelectItem value="light">{t("Light")}</SelectItem>
                <SelectItem value="dark">{t("Dark")}</SelectItem>
              </SelectContent>
            </Select>
          </FloatingField>

          <FloatingField
            label={t("Language")}
            variant="select"
            labelClassName="bg-background"
            active
          >
            <Select
              value={locale}
              onValueChange={(value) => setLocale((value as LocaleCode) ?? defaultLocale)}
            >
              <SelectTrigger className={selectClassName}>
                <SelectValue placeholder={t("Language")}>
                  {locales.find((l) => l.code === locale)?.label ?? defaultLocale}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {locales.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FloatingField>
        </div>
      </div>
    </TablePageLayout>
  );
}
