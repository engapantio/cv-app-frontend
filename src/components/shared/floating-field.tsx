"use client";

import { cn } from "@/lib/utils";

interface FloatingFieldProps {
  label: string;
  variant?: "input" | "textarea" | "select";
  error?: string;
  active?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

const INPUT_LABEL =
  "absolute left-3 bg-background px-1 text-xs text-muted-foreground transition-all duration-200 pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary -top-2.5 translate-y-0";

const TEXTAREA_LABEL =
  "absolute left-3 bg-background px-1 text-xs text-muted-foreground transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary -top-2.5 translate-y-0";

const SELECT_LABEL =
  "absolute left-3 bg-card px-1 text-xs transition-all duration-200 pointer-events-none -top-2.5 translate-y-0 text-foreground group-focus-within:text-primary";

export function FloatingField({
  label,
  variant = "input",
  error,
  active = false,
  className,
  containerClassName,
  labelClassName,
  children,
}: FloatingFieldProps) {
  const labelClasses =
    variant === "select"
      ? cn(SELECT_LABEL, !active && "opacity-0 text-muted-foreground")
      : variant === "textarea"
        ? TEXTAREA_LABEL
        : INPUT_LABEL;
  return (
    <div className={cn("relative", containerClassName)}>
      <div
        className={cn(
          "relative rounded-none border border-border transition-colors focus-within:border-primary",
          variant === "select" && "group",
          className,
        )}
      >
        {children}
        <span className={cn(labelClasses, labelClassName)}>{label}</span>
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
