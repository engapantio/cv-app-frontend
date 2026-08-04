"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

const TABS = [
  { key: "details", href: "details" },
  { key: "skills", href: "skills" },
  { key: "projects", href: "projects" },
  { key: "preview", href: "preview" },
] as const;

export function CvLayoutClient({
  cvId,
  initialCvName,
  children,
}: {
  cvId: string;
  initialCvName?: string | null;
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

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center h-11 gap-2 mb-6">
        <Link
          href="/cvs"
          className="text-base text-foreground/70 hover:text-primary transition-colors"
        >
          {t("breadcrumbs.cvs")}
        </Link>
        <ChevronRight className="size-5" />
        <span style={{ color: "#c63031" }}>{cvName}</span>
        <ChevronRight className="size-5" />
        <span className="text-base text-foreground/70">
          {TABS.find((tab) => tab.href === currentTab)
            ? tabLabels[currentTab as (typeof TABS)[number]["key"]]
            : currentTab}
        </span>
      </div>

      <div className="flex mb-6 gap-0">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.href;
          return (
            <Link
              key={tab.href}
              href={`/cvs/${cvId}/${tab.href}`}
              className={
                "uppercase w-37.5 text-center text-sm font-medium py-3 relative transition-colors " +
                (isActive
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-foreground hover:text-primary")
              }
            >
              {tabLabels[tab.key]}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
