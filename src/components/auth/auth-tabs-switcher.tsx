"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Log in", href: "/auth/login" },
  { label: "Sign up", href: "/auth/signup" },
] as const;

export function AuthTabsSwitcher() {
  const pathname = usePathname();

  return (
    <div className="flex rounded-xl border border-border/60 bg-muted/40 p-1">
      {TABS.map(({ label, href }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
