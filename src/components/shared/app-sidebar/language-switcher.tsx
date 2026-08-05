"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { locales } from "@/i18n/locales";
import { useLocalePref, setLocale } from "@/lib/preferences/locale";

export function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocalePref();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={t("header.selectLanguage")} />}
      >
        <Globe className="text-icon" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex justify-around">
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={cn(
              locale === lang.code && "bg-sidebar-accent",
              "w-7 hover:bg-sidebar-accent",
            )}
          >
            {lang.short}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
