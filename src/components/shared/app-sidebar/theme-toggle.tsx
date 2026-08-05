"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const t = useTranslations();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("header.toggleTheme")}
      className="rounded-full"
    >
      {!mounted ? (
        <span className="h-5 w-5" />
      ) : isDark ? (
        <Sun className="h-5 w-5 text-icon" />
      ) : (
        <Moon className="h-5 w-5 text-icon" />
      )}
    </Button>
  );
}
