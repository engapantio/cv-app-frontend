import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  padding?: boolean;
}

export function Container({
  children,
  className,
  maxWidth = "1440px",
  padding = true,
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full", padding && "px-4 sm:px-6 lg:px-8", className)}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
}
