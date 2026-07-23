"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { CvDocument } from "@/gql/generated/graphql";
import { ChevronRight } from "lucide-react";

const TABS = [
  { label: "Details", href: "details" },
  { label: "Skills", href: "skills" },
  { label: "Projects", href: "projects" },
  { label: "Preview", href: "preview" },
] as const;

export function CvLayoutClient({
  cvId,
  children,
}: {
  cvId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data } = useQuery(CvDocument, {
    variables: { cvId },
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const cvName = data?.cv?.name ?? "CV";
  const currentTab = pathname.split("/").pop() ?? "details";

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
        <Link href="/cvs" className="hover:text-primary">
          CVs
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{cvName}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-primary">
          {TABS.find((t) => t.href === currentTab)?.label ?? currentTab}
        </span>
      </div>

      <div className="flex border-b border-border mb-6">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.href;
          return (
            <Link
              key={tab.href}
              href={`/cvs/${cvId}/${tab.href}`}
              className={
                "px-4 py-3 text-sm font-medium transition-colors relative " +
                (isActive
                  ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground")
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
