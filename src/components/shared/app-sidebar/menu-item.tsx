"use client";

import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLongPress } from "@/hooks/use-long-press";
import { useIsHoverCapable } from "@/hooks/use-is-hover-capable";
import { useIsPhone } from "@/hooks/use-is-phone";

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
    isMobile ? "p-3 w-auto! shrink-0" : "px-4 py-4 h-auto",
    isActive &&
      (isMobile
        ? "bg-sidebar-accent rounded-full text-foreground"
        : "bg-sidebar-accent rounded-r-[200px] rounded-l-none text-foreground"),
    !isMobile && "hover:rounded-r-[200px] rounded-l-none",
  );

  if (!isMobile) {
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

  return <FooterNavItem item={item} label={label} isActive={isActive} onClick={onClick} />;
}

function FooterNavItem({
  item,
  label,
  isActive,
  onClick,
}: {
  item: MenuItemData;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const isPhone = useIsPhone();
  const hoverCapable = useIsHoverCapable();
  const [labelOpen, setLabelOpen] = useState(false);
  const { onTouchStart, onTouchEnd, onTouchMove, consumeLongPress } = useLongPress(() =>
    setLabelOpen(true),
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (consumeLongPress()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick();
  };

  const handleTouchEnd = () => {
    onTouchEnd();
    setLabelOpen(false);
  };

  const classes = cn(
    "flex items-center justify-center w-full h-full",
    "p-3 w-auto! shrink-0 text-icon select-none [-webkit-touch-callout:none]",
    isActive && "bg-sidebar-accent rounded-full text-foreground",
  );

  const link = (
    <Link
      href={item.href}
      prefetch={item.prefetch ?? true}
      aria-label={label}
      onClick={isPhone ? handleClick : onClick}
      className={classes}
    >
      <item.icon className="size-6" />
      {!isPhone && (
        <span className="font-normal text-base leading-normal tracking-[0.01em]">{label}</span>
      )}
    </Link>
  );

  if (!isPhone) {
    return link;
  }

  const id = `mobile-nav-${item.href}`;

  return (
    <Tooltip open={labelOpen} onOpenChange={setLabelOpen} triggerId={id}>
      <TooltipTrigger
        id={id}
        disabled
        onTouchStart={onTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={onTouchMove}
        onPointerEnter={hoverCapable ? () => setLabelOpen(true) : undefined}
        onPointerLeave={hoverCapable ? () => setLabelOpen(false) : undefined}
        onFocus={hoverCapable ? () => setLabelOpen(true) : undefined}
        onBlur={hoverCapable ? () => setLabelOpen(false) : undefined}
        render={link}
      />
      <TooltipContent side="top" align="center">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
