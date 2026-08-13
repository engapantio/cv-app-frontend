"use client";

import Link from "next/link";
import type React from "react";
import { cn } from "@/lib/utils";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export interface MenuItemData {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  prefetch?: boolean;
}

export function MenuItem({
  item,
  label,
  isActive,
  isMobile,
  onClick,
}: {
  item: MenuItemData;
  label: string;
  isActive: boolean;
  isMobile: boolean;
  onClick: () => void;
}) {
  const baseClasses = cn(
    "w-full text-icon",
    isMobile ? "p-5 w-auto! shrink-0" : "px-4 py-4 h-auto",
    isActive &&
      (isMobile
        ? "bg-sidebar-accent rounded-full text-foreground"
        : "bg-sidebar-accent rounded-r-[200px] rounded-l-none text-foreground"),
    !isMobile && "hover:rounded-r-[200px] rounded-l-none",
  );

  return (
    <SidebarMenuButton
      className={baseClasses}
      render={
        <Link
          href={item.href}
          prefetch={item.prefetch ?? true}
          onClick={onClick}
          className="flex items-center gap-4 w-full h-full"
        />
      }
    >
      <item.icon className="h-4 w-4" />
      <span className="font-normal text-base leading-normal tracking-[0.01em]">{label}</span>
    </SidebarMenuButton>
  );
}
