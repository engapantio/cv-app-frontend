"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 text-center">
      <p className="text-8xl font-bold tracking-tight text-primary sm:text-9xl">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-medium text-foreground">{t("title")}</h1>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">{t("description")}</p>
      </div>
      <Button nativeButton={false} render={<Link href="/" />}>
        {t("backHome")}
      </Button>
    </div>
  );
}
