"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const TABS = [
  { label: "Details", href: "details" },
  { label: "Skills", href: "skills" },
  { label: "Projects", href: "projects" },
  { label: "Preview", href: "preview" },
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

  const cvName = initialCvName ?? "CV";
  const currentTab = pathname.split("/").pop() ?? "details";

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center h-11 gap-2 mb-6">
        <Link
          href="/cvs"
          className="text-base text-foreground/70 hover:text-primary transition-colors"
        >
          CVs
        </Link>
        <ChevronRight className="size-5" />
        <span style={{ color: "#c63031" }}>{cvName}</span>
        <ChevronRight className="size-5" />
        <span className="text-base text-foreground/70">
          {TABS.find((t) => t.href === currentTab)?.label ?? currentTab}
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
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
