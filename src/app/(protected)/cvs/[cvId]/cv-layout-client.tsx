"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { TabNav, type TabNavItem } from "@/components/shared/tab-nav";

const TABS = [
  { key: "details", href: "details" },
  { key: "skills", href: "skills" },
  { key: "projects", href: "projects" },
  { key: "preview", href: "preview" },
] as const;

export function CvLayoutClient({
  cvId,
  initialCvName,
  cvUserId,
  children,
}: {
  cvId: string;
  initialCvName?: string | null;
  cvUserId?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations();

  const cvName = initialCvName ?? "CV";
  const currentTab = pathname.split("/").pop() ?? "details";

  const tabLabels: Record<(typeof TABS)[number]["key"], string> = {
    details: t("tabs.details"),
    skills: t("tabs.skills"),
    projects: t("tabs.projects"),
    preview: t("tabs.preview"),
  };

  const tabItems: TabNavItem[] = TABS.map((tab) => ({
    key: tab.key,
    label: tabLabels[tab.key],
    href: `/cvs/${cvId}/${tab.href}`,
  }));

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center h-11 gap-2 mb-4">
        <Link
          href={cvUserId ? `/users/${cvUserId}/cvs` : "/cvs"}
          className="text-base text-foreground/70 hover:text-primary transition-colors"
        >
          {t("breadcrumbs.cvs")}
        </Link>
        <ChevronRight className="size-5" />
        <span className="text-primary">{cvName}</span>
        <ChevronRight className="size-5" />
        <span className="text-base text-foreground/70">
          {TABS.find((tab) => tab.href === currentTab)
            ? tabLabels[currentTab as (typeof TABS)[number]["key"]]
            : currentTab}
        </span>
      </div>

      <TabNav items={tabItems} />

      {children}
    </div>
  );
}
