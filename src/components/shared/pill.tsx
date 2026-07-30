"use client";

import { cn } from "@/lib/utils";

interface PillProps {
  text: string;
  variant?: "muted" | "transparent";
}

export function Pill({ text, variant = "muted" }: PillProps) {
  return (
    <span
      className={cn(
        "inline-block px-3 py-1 rounded-full text-sm truncate max-w-[25%] min-w-0 select-none",
        variant === "muted" && "bg-muted text-muted-foreground",
        variant === "transparent" &&
          "bg-transparent text-black dark:text-white border border-current",
      )}
      title={text}
    >
      {text}
    </span>
  );
}
