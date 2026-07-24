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
  const showTabs = TABS.some((tab) => tab.href === pathname);

  if (!showTabs) return null;

  return (
    <div className="flex justify-center">
      <div className="flex">
        {TABS.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex h-12 w-37.5 items-center justify-center text-sm tracking-[0.4px] uppercase transition-colors",
                active
                  ? "font-semibold text-primary"
                  : "font-medium text-foreground hover:text-primary",
              )}
            >
              {label}
              {active && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
