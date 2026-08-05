"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface TabNavItem {
  key: string;
  label: string;
  href: string;
}

export function TabNav({ items }: { items: TabNavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap mb-4 gap-0">
      {items.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.key}
            href={tab.href}
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
  );
}
