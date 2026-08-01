"use client";

import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableEmptyStateProps {
  message: string;
  responsive?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function TableEmptyState({
  message,
  responsive = false,
  className,
  iconClassName,
  textClassName,
}: TableEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-muted-foreground",
        responsive && "max-md:py-8 md:max-[1439px]:py-12 min-[1440px]:py-16",
        className,
      )}
    >
      <Inbox
        className={cn(
          "mb-2",
          responsive
            ? "max-md:h-10 max-md:w-10 md:max-[1439px]:h-12 md:max-[1439px]:w-12 min-[1440px]:h-16 min-[1440px]:w-16"
            : "h-16 w-16",
          iconClassName,
        )}
      />
      <p
        className={cn(
          responsive ? "max-md:text-sm md:max-[1439px]:text-base min-[1440px]:text-lg" : "text-lg",
          textClassName,
        )}
      >
        {message}
      </p>
    </div>
  );
}
