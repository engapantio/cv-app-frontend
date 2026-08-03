import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildFullName(first?: string | null, last?: string | null): string {
  return [first, last].filter(Boolean).join(" ").trim();
}
