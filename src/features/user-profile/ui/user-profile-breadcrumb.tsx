"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, User } from "lucide-react";

export function UserProfileBreadcrumb({ userName }: { userName: string }) {
  const t = useTranslations();

  return (
    <div className="flex items-center h-11 gap-4">
      <Link
        href="/users"
        className="text-base text-foreground/70 hover:text-primary transition-colors"
      >
        {t("breadcrumbs.employees")}
      </Link>
      <ChevronRight className="text-icon w-5 h-5" />
      <div className="text-primary flex gap-2">
        <User className="w-5 h-5" />
        {userName}
      </div>
    </div>
  );
}
