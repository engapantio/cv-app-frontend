"use client";

import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TableToolbarProps {
  value: string;
  onChange: (value: string) => void;
  actionLabel: string;
  onAction?: () => void;
  showAction?: boolean;
  actionClassName?: string;
  searchClassName?: string;
  searchInputClassName?: string;
}

export function TableToolbar({
  value,
  onChange,
  actionLabel,
  onAction,
  showAction = true,
  actionClassName,
  searchClassName,
  searchInputClassName,
}: TableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <SearchBar
        value={value}
        onChange={onChange}
        wrapperClassName={searchClassName}
        inputClassName={searchInputClassName}
      />
      {showAction && onAction && (
        <Button
          variant="ghost"
          className={cn(
            "uppercase text-primary hover:text-primary text-sm font-medium cursor-pointer dark:hover:bg-white/15 dark:hover:brightness-125",
            actionClassName,
          )}
          onClick={onAction}
        >
          +<span className="hidden md:inline">&nbsp;{actionLabel}</span>
        </Button>
      )}
    </div>
  );
}
