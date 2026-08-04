"use client";

import { cn } from "@/lib/utils";

interface PillProps {
  text: string;
  variant?: "muted" | "transparent" | "responsibility";
}

export function Pill({ text, variant = "muted" }: PillProps) {
  return (
    <span
      className={cn(
        "inline-block px-3 py-1 rounded-full text-sm truncate max-w-[25%] min-w-0 select-none",
        variant === "muted" && "bg-muted text-muted-foreground",
        variant === "responsibility" &&
          "bg-muted text-muted-foreground dark:bg-[#555555] dark:text-white",
        variant === "transparent" &&
          "bg-transparent text-foreground border border-muted-foreground",
      )}
      title={text}
    >
      {text}
    </span>
  );
}
